package mr.bmci.gestioncommandesbackend.ports;

import mr.bmci.gestioncommandesbackend.domaine.Role;
import mr.bmci.gestioncommandesbackend.domaine.Utilisateur;

import java.util.Optional;
import java.util.List;
public interface UtilisateurRepository {
    boolean existsByUsername(String username);
    Utilisateur save(Utilisateur utilisateur);

    Optional<Utilisateur> findByMatricule(String username);

    List<Utilisateur> findByRole(Role role);


    Optional<Utilisateur> findById(Long idmanager);

    void deleteById(int userId);

    List<Utilisateur> findAll();



}