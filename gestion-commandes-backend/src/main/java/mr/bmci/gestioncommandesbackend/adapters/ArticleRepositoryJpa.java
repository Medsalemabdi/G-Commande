package mr.bmci.gestioncommandesbackend.adapters;


import mr.bmci.gestioncommandesbackend.domaine.Article;
import mr.bmci.gestioncommandesbackend.ports.ArticleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

interface SpringDataArticleRepo extends JpaRepository<Article, Long> {

    List<Article> findByCategorieId(Long categorieId);
}

@Repository
public class ArticleRepositoryJpa implements ArticleRepository {
    private final SpringDataArticleRepo jpa;
    @Autowired
    public ArticleRepositoryJpa(SpringDataArticleRepo jpa) {
        this.jpa = jpa;
    }

    @Override
    public Article save(Article newArticle) {
        return jpa.save(newArticle);

    }

    @Override
    public List<Article> findAll(){
        return jpa.findAll();
    }

    @Override
    public Article findById(Long id){
        return jpa.findById(id).get();
    }

    @Override
    public Article updateArticle(Article existingArticle) {
        if (existingArticle.getId() == null) {
            throw new IllegalArgumentException("Cannot update article without ID");
        }
        return jpa.save(existingArticle);
    }

    @Override
    public void deleteById(Long id){
        jpa.deleteById(id);
    }
    
    @Override
    public List<Article> findByCategorieId(Long categorieId) {
        return jpa.findByCategorieId(categorieId);
    }
}
