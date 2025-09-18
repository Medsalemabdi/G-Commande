package mr.bmci.gestioncommandesbackend.ports;

import mr.bmci.gestioncommandesbackend.domaine.Categorie;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface CategorieRepository {

    Categorie findCategorieById(Long idCategorie);


    List<Categorie> findAll();

    Categorie save(Categorie categorie);

    void deleteById(Long id);
}
