package mr.bmci.gestioncommandesbackend.application;

import mr.bmci.gestioncommandesbackend.domaine.Categorie;
import mr.bmci.gestioncommandesbackend.ports.CategorieRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategorieService {
    private CategorieRepository categorieRepository;


    public CategorieService(CategorieRepository categorieRepository) {
        this.categorieRepository = categorieRepository;
    }

    public Categorie findCategorieById(Long idCategorie) {
        return categorieRepository.findCategorieById(idCategorie);
    }

    public List<Categorie> listCategories() {
        return categorieRepository.findAll();
    }

    public Categorie createCategorie(Categorie categorie) {
        return categorieRepository.save(categorie);
    }

    public Categorie updateCategorie(Categorie existing) {
        return categorieRepository.save(existing);
    }
    @Transactional
    public void deleteCategorie(Long id) {
        categorieRepository.deleteById(id);
    }
}
