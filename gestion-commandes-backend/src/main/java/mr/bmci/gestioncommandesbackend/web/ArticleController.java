package mr.bmci.gestioncommandesbackend.web;

import mr.bmci.gestioncommandesbackend.application.ArticleService;
import mr.bmci.gestioncommandesbackend.application.CategorieService;
import mr.bmci.gestioncommandesbackend.application.StockService;
import mr.bmci.gestioncommandesbackend.domaine.Article;
import mr.bmci.gestioncommandesbackend.domaine.Categorie;
import mr.bmci.gestioncommandesbackend.web.dto.ArticleDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/article")
public class ArticleController {
    private final ArticleService articleService;
    private final CategorieService categorieService;

    public ArticleController(ArticleService articleService, StockService stockService, CategorieService categorieService) {
        this.articleService = articleService;
        this.categorieService = categorieService;
    }

    // ✅ CREATE
    @PostMapping
    public ResponseEntity<Article> addArticle(@RequestBody ArticleDto articleDto,@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {return ResponseEntity.status(401).build();}
        Article newArticle = new Article();
        newArticle.setNom(articleDto.getNom());
        newArticle.setDescription(articleDto.getDescription());

        Categorie categorie = categorieService.findCategorieById(articleDto.getCategorie_id());
        newArticle.setCategorie(categorie);

        Article saved = articleService.createArticle(newArticle);

        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // ✅ READ ALL
    @GetMapping
    public ResponseEntity<List<Article>> getAllArticles(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {return ResponseEntity.status(401).build();}
        List<Article> articles = articleService.getAllArticles();
        return ResponseEntity.ok(articles);
    }

    // ✅ READ ONE
    @GetMapping("/{id}")
    public ResponseEntity<Article> getArticleById(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {return ResponseEntity.status(401).build();}
        Article article = articleService.findArticleById(id);
        if (article == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(article);
    }

    // ✅ UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<Article> updateArticle(@PathVariable Long id, @RequestBody ArticleDto articleDto, @AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {return ResponseEntity.status(401).build();}
        Article existingArticle = articleService.findArticleById(id);
        if (existingArticle == null) {
            return ResponseEntity.notFound().build();
        }

        existingArticle.setNom(articleDto.getNom());
        existingArticle.setDescription(articleDto.getDescription());

        if (articleDto.getCategorie_id() != null) {
            Categorie categorie = categorieService.findCategorieById(articleDto.getCategorie_id());
            existingArticle.setCategorie(categorie);
        }

        Article updated = articleService.updateArticle(existingArticle);
        return ResponseEntity.ok(updated);
    }

    // ✅ DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteArticle(@PathVariable Long id,@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {return ResponseEntity.status(401).build();}
        Article existingArticle = articleService.findArticleById(id);
        if (existingArticle == null) {
            return ResponseEntity.notFound().build();
        }

        articleService.deleteArticle(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Categorie>> getAllCategories(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) { return ResponseEntity.status(401).build(); }
        List<Categorie> categories = categorieService.listCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/by-categorie/{categorieId}")
    public ResponseEntity<List<Article>> getArticlesByCategorie(@PathVariable Long categorieId,
                                                                @AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) { return ResponseEntity.status(401).build(); }
        Categorie categorie = categorieService.findCategorieById(categorieId);
        if (categorie == null) { return ResponseEntity.notFound().build(); }

        List<Article> articles = articleService.findByCategorieId(categorieId);
        return ResponseEntity.ok(articles);
    }
}
