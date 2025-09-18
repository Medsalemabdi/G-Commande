package mr.bmci.gestioncommandesbackend.application;

import mr.bmci.gestioncommandesbackend.domaine.Role;
import mr.bmci.gestioncommandesbackend.domaine.Utilisateur;
import mr.bmci.gestioncommandesbackend.ports.UtilisateurRepository;
import mr.bmci.gestioncommandesbackend.web.exception.ConflictException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service

public class UtilisateurService implements UserDetailsService {

    private final UtilisateurRepository repo;
    private RoleService roleService;
    public UtilisateurService(UtilisateurRepository repo, RoleService roleService) {
        this.repo = repo;
        this.roleService = roleService;
    }

    /** Méthode métier de création d’utilisateur */
    public Utilisateur save(Utilisateur u) {
        if (repo.existsByUsername(u.getMatricule())) {
            throw new ConflictException("Username already exists");
        }


        return repo.save(u);
    }

    /** Finder utilisé pour l’authentification */
    public Optional<Utilisateur> findByUsername(String username) {
        return repo.findByMatricule(username);
    }

    /**
     * Chargement pour Spring Security.
     * Transforme votre Utilisateur en UserDetails avec un GrantedAuthority.
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Utilisateur user = repo.findByMatricule(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return new org.springframework.security.core.userdetails.User(
                user.getMatricule(),
                user.getMdp_hash(),
                Collections.singletonList(new SimpleGrantedAuthority(user.getRole().getName()))
        );
    }

    public List<Utilisateur> findByRole(String role) {
       Role r = roleService.findByName(role);
       return repo.findByRole(r);
    }

    public Utilisateur findById(Long idmanager) {

        return repo.findById(idmanager).get();
    }

    @Transactional
    public void deleteById(int userId) {
        repo.deleteById(userId);
    }

    public List<Utilisateur> findAll() {
        return repo.findAll();
    }

    public List<Utilisateur> findManagers() {
        return repo.findByRole(roleService.findByName("Manager"));
    }

    public Optional<Utilisateur> findByMatricule(String matricule) {
        return repo.findByMatricule(matricule);
    }

    public Utilisateur updateProfile(String matricule , String nom, String prenom, String email) {
        Utilisateur u = repo.findByMatricule(matricule)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable: " + matricule));
        u.setNom(nom);
        u.setPrenom(prenom);
        u.setEmail(email);
        // pas de check sur matricule ici (il ne change pas)
        return repo.save(u);
    }
}

