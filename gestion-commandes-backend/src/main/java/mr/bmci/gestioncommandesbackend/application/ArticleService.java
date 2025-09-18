package mr.bmci.gestioncommandesbackend.application;

import mr.bmci.gestioncommandesbackend.domaine.Article;
import mr.bmci.gestioncommandesbackend.domaine.Stock;
import mr.bmci.gestioncommandesbackend.ports.ArticleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ArticleService {
    private final StockService stockService;
    private final ArticleRepository articleRepository;

    public ArticleService(StockService stockService, ArticleRepository articleRepository) {
        this.stockService = stockService;
        this.articleRepository = articleRepository;
    }
    public Article createArticle(Article newArticle) {
        Article savedArticle = articleRepository.save(newArticle);
        return savedArticle;
    }

    public List<Article> getAllArticles() {
        return articleRepository.findAll();
    }

    public Article findArticleById(Long id) {
        return articleRepository.findById(id);
    }

    public Article updateArticle(Article existingArticle) {
        return articleRepository.updateArticle(existingArticle);
    }

    @Transactional
    public void deleteArticle(Long id) {
        articleRepository.deleteById(id);
    }

    public List<Article> findByCategorieId(Long categorieId) {
        return articleRepository.findByCategorieId(categorieId);
    }
}
