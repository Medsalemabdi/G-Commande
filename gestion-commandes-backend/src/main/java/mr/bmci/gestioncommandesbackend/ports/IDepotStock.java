package mr.bmci.gestioncommandesbackend.ports;

import mr.bmci.gestioncommandesbackend.domaine.Article;
import mr.bmci.gestioncommandesbackend.domaine.Stock;

import java.util.List;

public interface IDepotStock {
    Stock save(Stock stock);

    List<Stock> findAll();

    Stock findById(Long id);

    void deleteById(Long id);

    Stock findByArticle(Article article);
}
