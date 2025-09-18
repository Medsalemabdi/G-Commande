package mr.bmci.gestioncommandesbackend.web;

import mr.bmci.gestioncommandesbackend.application.RoleService;
import mr.bmci.gestioncommandesbackend.application.UtilisateurService;
import mr.bmci.gestioncommandesbackend.domaine.Role;
import mr.bmci.gestioncommandesbackend.domaine.Utilisateur;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class AdminManagerController {

    private final UtilisateurService utilisateurService;
    private final RoleService roleService;

    public AdminManagerController(UtilisateurService utilisateurService, RoleService roleService) {
        this.utilisateurService = utilisateurService;
        this.roleService = roleService;
    }

    @GetMapping
    public ResponseEntity<List<Utilisateur>> getAllUsers(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {return ResponseEntity.status(401).build();}
        try{

            return ResponseEntity.ok(utilisateurService.findAll());

        }
        catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.ok().build();
        }
    }

    @GetMapping("/managers")
    public ResponseEntity<List<Utilisateur>> getManagers(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {return ResponseEntity.status(401).build();}
        try{
            return ResponseEntity.ok(utilisateurService.findManagers());
        }catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.ok().build();
        }

    }

    @GetMapping("/roles")
    public ResponseEntity<List<Role>> listRoles(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {return ResponseEntity.status(401).build();}

        try {
            return ResponseEntity.ok(roleService.getRoles());
        }catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.noContent().build();
        }
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable int userId,@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {return ResponseEntity.status(401).build();}
        try {
            utilisateurService.deleteById(userId);
            return ResponseEntity.noContent().build();
        }
        catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.noContent().build();
        }
    }


}
