package mr.bmci.gestioncommandesbackend.ports;

import mr.bmci.gestioncommandesbackend.domaine.Commande;

import java.util.List;
import java.util.Optional;

public interface IDepotCommande {
    Commande save(Commande commande);

    List<Commande> findAll();

    Optional<Commande> findById(Long id);

    void delete(Long id);

    List<Commande> findByUtilisateurMatricule(String utilisateurMatricule);

    List<Commande> findByUtilisateur_Responsable_Matricule(String matricule);

    List<Commande> findByEtatCommande_IdNot(Long etatId);
}
