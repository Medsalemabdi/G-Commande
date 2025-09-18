package mr.bmci.gestioncommandesbackend.adapters;

import mr.bmci.gestioncommandesbackend.domaine.Commande;
import mr.bmci.gestioncommandesbackend.ports.IDepotCommande;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


interface CommandeRepository extends JpaRepository<Commande,Long>{
    List<Commande> findByUtilisateurMatricule(String utilisateurMatricule);
    List<Commande> findByUtilisateur_Responsable_Matricule(String matricule);
    List<Commande> findByEtatCommande_IdNot(Long etatId);
}

@Repository
public class DepotCommandeJpa implements IDepotCommande {
    private final CommandeRepository jpa;
    @Autowired
    public DepotCommandeJpa(CommandeRepository jpa) {
        this.jpa = jpa;
    }
    @Override
    public Commande save(Commande commande) {
        return jpa.save(commande);
    }

    @Override
    public List<Commande> findAll(){
        return jpa.findAll();
    }

    @Override
    public Optional<Commande> findById(Long id) {
        return jpa.findById(id);
    }

    @Override
    public void delete(Long id) {
        jpa.deleteById(id);
    }

    @Override
    public List<Commande> findByUtilisateurMatricule(String utilisateurMatricule){
        return jpa.findByUtilisateurMatricule(utilisateurMatricule);
    }

    @Override
    public List<Commande> findByUtilisateur_Responsable_Matricule(String matricule){
        return jpa.findByUtilisateur_Responsable_Matricule(matricule);
    }

    @Override
    public  List<Commande> findByEtatCommande_IdNot(Long etatId){
        return jpa.findByEtatCommande_IdNot(etatId);
    }
}
