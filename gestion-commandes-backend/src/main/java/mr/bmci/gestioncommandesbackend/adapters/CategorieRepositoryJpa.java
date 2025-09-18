package mr.bmci.gestioncommandesbackend.adapters;

import mr.bmci.gestioncommandesbackend.domaine.Categorie;
import mr.bmci.gestioncommandesbackend.ports.CategorieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

interface SpringDataCategorieRepo extends JpaRepository<Categorie, Long> {
    Categorie findCategorieById(Long id);
    List<Categorie> findAll();
}
@Repository
public class CategorieRepositoryJpa implements CategorieRepository {
    private final SpringDataCategorieRepo jpa;

    @Autowired
    public CategorieRepositoryJpa(SpringDataCategorieRepo jpa) {
        this.jpa = jpa;
    }

    @Override
    public Categorie findCategorieById(Long id){
        return jpa.findCategorieById(id);
    }

    @Override
    public List<Categorie> findAll(){
        return jpa.findAll();
    }

    @Override
    public Categorie save(Categorie categorie) {
        return jpa.save(categorie);
    }

    @Override
    public void deleteById(Long id){
        jpa.deleteById(id);
    }
}
