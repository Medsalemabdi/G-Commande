package mr.bmci.gestioncommandesbackend.ports;


import mr.bmci.gestioncommandesbackend.domaine.Article;

import java.util.List;

public interface ArticleRepository {

    Article save(Article newArticle);

    List<Article> findAll();

    Article findById(Long id);

    Article updateArticle(Article existingArticle);

    void deleteById(Long id);

    List<Article> findByCategorieId(Long categorieId);
}
