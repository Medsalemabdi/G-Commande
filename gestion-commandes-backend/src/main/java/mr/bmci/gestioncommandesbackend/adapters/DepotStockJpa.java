package mr.bmci.gestioncommandesbackend.adapters;


import mr.bmci.gestioncommandesbackend.domaine.Article;
import mr.bmci.gestioncommandesbackend.domaine.Stock;
import mr.bmci.gestioncommandesbackend.ports.IDepotStock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


interface SpringDataStockjpa extends JpaRepository<Stock, Long> {

    Stock findByArticle(Article article);
}

@Repository
public class DepotStockJpa implements IDepotStock {
    private final SpringDataStockjpa jpa;

    @Autowired
    public DepotStockJpa(SpringDataStockjpa jpa) {
        this.jpa = jpa;
    }

    @Override
    public Stock save(Stock stock) {
        return jpa.save(stock);
    }

    @Override
    public List<Stock> findAll(){
        return jpa.findAll();
    }

    @Override
    public Stock findById(Long id){
        return jpa.findById(id).get();
    }

    @Override
    public void deleteById(Long id){
        jpa.deleteById(id);
    }
    
    @Override
    public Stock findByArticle(Article article){
        return jpa.findByArticle(article);
    }
}
