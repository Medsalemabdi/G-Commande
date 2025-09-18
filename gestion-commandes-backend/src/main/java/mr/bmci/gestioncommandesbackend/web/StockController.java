package mr.bmci.gestioncommandesbackend.web;

import mr.bmci.gestioncommandesbackend.application.ArticleService;
import mr.bmci.gestioncommandesbackend.application.StockService;
import mr.bmci.gestioncommandesbackend.domaine.Article;
import mr.bmci.gestioncommandesbackend.domaine.Stock;
import mr.bmci.gestioncommandesbackend.web.dto.StockDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock")
public class StockController {
    private final StockService stockService;
    private final ArticleService articleService;

    public StockController(StockService stockService, ArticleService articleService) {
        this.stockService = stockService;
        this.articleService = articleService;
    }

    // ✅ Liste des stocks
    @GetMapping
    public ResponseEntity<List<StockDto>> getAllStocks(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();}
        return ResponseEntity.ok(stockService.getAllStocksAsDTO());
    }

    // ✅ Obtenir un stock par ID
    @GetMapping("/{id}")
    public ResponseEntity<Stock> getStockById(@PathVariable Long id) {
        return stockService.findStockById(id) != null
                ? ResponseEntity.ok(stockService.findStockById(id))
                : ResponseEntity.notFound().build();
    }

    // ✅ Créer un stock
    @PostMapping
    public ResponseEntity<Stock> addStock(@RequestBody StockDto sdto, @AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();}
        Stock stock = new Stock();
        Article article = articleService.findArticleById(sdto.getArticle_id());
        stock.setArticle(article);
        stock.setQuantite(sdto.getQuantite());
        Stock saved = stockService.createStock(stock);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // ✅ Mettre à jour un stock
    @PutMapping("/{id}")
    public ResponseEntity<StockDto> updateStock(@PathVariable Long id, @RequestBody StockDto stock,@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();}
        Stock existing = stockService.findStockById(id);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        Article article = articleService.findArticleById(stock.getArticle_id());
        existing.setQuantite(stock.getQuantite());
        existing.setArticle(article); // si lié à un article
        Stock updated = stockService.updateStock(existing);
        return ResponseEntity.ok(stock);
    }

    // ✅ Supprimer un stock
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStock(@PathVariable Long id,@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();}
        Stock existing = stockService.findStockById(id);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        stockService.deleteStock(id);
        return ResponseEntity.noContent().build();
    }
}
