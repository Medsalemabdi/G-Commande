package mr.bmci.gestioncommandesbackend.adapters;

import mr.bmci.gestioncommandesbackend.domaine.Role;
import mr.bmci.gestioncommandesbackend.domaine.Utilisateur;
import mr.bmci.gestioncommandesbackend.ports.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

interface SpringDataUtilisateurRepo extends JpaRepository<Utilisateur,Long> {
    boolean existsByMatricule(String username);
    Optional<Utilisateur> findByMatricule(String username);
    List<Utilisateur> findUtilisateurByRole(Role role);
    Optional<Utilisateur> findById(Long idmanager);
    List<Utilisateur> findAll();
    void deleteById(int id);
}

@Repository
public class UtilisateurRepositoryJpa implements UtilisateurRepository {
    private final SpringDataUtilisateurRepo jpa;


    @Autowired
    public UtilisateurRepositoryJpa(SpringDataUtilisateurRepo jpa) {
        this.jpa = jpa;
    }

    @Override
    public boolean existsByUsername(String username) {
        return jpa.existsByMatricule(username);
    }


    @Override
    public Utilisateur save(Utilisateur u) {
        return jpa.save(u);
    }

    @Override
    public Optional<Utilisateur> findByMatricule(String username) {
        return jpa.findByMatricule(username);
    }

    @Override
    public List<Utilisateur> findByRole(Role role) {
        return jpa.findUtilisateurByRole(role);
    }

    @Override
    public Optional<Utilisateur> findById(Long id){
        return jpa.findById(id);
    }

    @Override
    public void deleteById(int id){
        try {
            jpa.deleteById(id);
        }
        catch (Exception e){
            throw new RuntimeException(e);
        }
    }
    @Override
    public List<Utilisateur> findAll(){
        return jpa.findAll();
    }




}

