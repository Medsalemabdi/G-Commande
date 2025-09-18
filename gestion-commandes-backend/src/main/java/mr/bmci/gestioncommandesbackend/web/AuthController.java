package mr.bmci.gestioncommandesbackend.web;

import jakarta.validation.Valid;
import mr.bmci.gestioncommandesbackend.application.AuthService;
import mr.bmci.gestioncommandesbackend.application.RoleService;
import mr.bmci.gestioncommandesbackend.application.UtilisateurService;
import mr.bmci.gestioncommandesbackend.domaine.Role;
import mr.bmci.gestioncommandesbackend.domaine.Utilisateur;
import mr.bmci.gestioncommandesbackend.web.dto.LoginRequest;
import mr.bmci.gestioncommandesbackend.web.dto.TokenResponse;
import mr.bmci.gestioncommandesbackend.web.dto.SignupRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final RoleService roleService;
    private final UtilisateurService utilisateurService;

    public AuthController(AuthService authService, RoleService roleService, UtilisateurService utilisateurService) {
        this.authService = authService;
        this.roleService = roleService;
        this.utilisateurService = utilisateurService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> register(
            @Valid @RequestBody SignupRequest req,@AuthenticationPrincipal Jwt jwt
    ) {
        if (jwt == null) {return ResponseEntity.status(401).build();}
        // 1) map the DTO into your domain entity
        Utilisateur u = new Utilisateur();
        u.setMatricule(req.getUsername());
        u.setNom(req.getNom());
        u.setPrenom(req.getPrenom());
        u.setEmail(req.getEmail());
        Role r = roleService.getByName(req.getRole());
        u.setRole(r);
        if ("Utilisateur_simple".equals(req.getRole())) {
            if (req.getManagerId() == null)
                return ResponseEntity.badRequest().body("Manager requis pour un utilisateur simple");
            Utilisateur mgr = utilisateurService.findById(req.getManagerId());
            u.setResponsable(mgr);
        }
        // store raw password here — AuthService.register() will hash it
        u.setMdp_hash(req.getPassword());
        // 2) call the service
        try {
            authService.register(u);
            return ResponseEntity.status(HttpStatus.CREATED).build();
        }catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest creds) {
        try {
            return ResponseEntity.ok(authService.login(creds));
        }catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
}
