package mr.bmci.gestioncommandesbackend.ports;

import mr.bmci.gestioncommandesbackend.domaine.EtatCommande;

import java.util.Optional;

public interface EtatCommandeRepository {
    Optional<EtatCommande> findByNom(String etat);
}
