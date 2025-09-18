package mr.bmci.gestioncommandesbackend.application;

import mr.bmci.gestioncommandesbackend.domaine.Article;
import mr.bmci.gestioncommandesbackend.domaine.Stock;
import mr.bmci.gestioncommandesbackend.ports.IDepotStock;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import mr.bmci.gestioncommandesbackend.web.dto.StockDto;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StockService {
    private IDepotStock stockRepo;

    public StockService(IDepotStock stockRepo) {
        this.stockRepo = stockRepo;
    }
    public Stock createStock(Stock stock) {
        return stockRepo.save(stock);

    }

    public List<Stock> getAllStocks() {
        return stockRepo.findAll();
    }

    public Stock findStockById(Long id) {
        return stockRepo.findById(id);
    }

    @Transactional
    public void deleteStock(Long id) {
        stockRepo.deleteById(id);
    }

    public Stock updateStock(Stock existing) {
        return stockRepo.save(existing);
    }
    public List<StockDto> getAllStocksAsDTO() {
        return stockRepo.findAll()
                .stream()
                .map(stock -> new StockDto(
                        stock.getId(),
                        stock.getArticle().getId(),
                        stock.getQuantite()

                ))
                .collect(Collectors.toList());
    }

    public boolean isDisponible(Article article, int quantite) {
        if (stockRepo.findByArticle(article) == null){
            return false;
        }
        else {
            if (stockRepo.findByArticle(article).getQuantite() < quantite){return false;}
            return true;
        }
    }

    public Stock findStockByArticle(Article article) {
        return stockRepo.findByArticle(article);
    }
}
