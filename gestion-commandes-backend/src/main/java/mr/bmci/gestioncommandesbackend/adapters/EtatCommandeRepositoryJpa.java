package mr.bmci.gestioncommandesbackend.adapters;


import mr.bmci.gestioncommandesbackend.domaine.EtatCommande;
import mr.bmci.gestioncommandesbackend.ports.EtatCommandeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

interface SpringEtatCommandeRepository extends JpaRepository<EtatCommande, Long> {
    Optional<EtatCommande> findByNom(String nom);
}

@Repository
public class EtatCommandeRepositoryJpa implements EtatCommandeRepository {

    private SpringEtatCommandeRepository jpa;

    @Autowired
    public EtatCommandeRepositoryJpa(SpringEtatCommandeRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public Optional<EtatCommande> findByNom(String etat) {
        return jpa.findByNom(etat);
    }

}
