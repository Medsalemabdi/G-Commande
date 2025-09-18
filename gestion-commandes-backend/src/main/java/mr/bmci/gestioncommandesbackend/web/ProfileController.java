// src/main/java/mr/bmci/gestioncommandesbackend/web/ProfileController.java
package mr.bmci.gestioncommandesbackend.web;

import jakarta.validation.Valid;
import mr.bmci.gestioncommandesbackend.application.UtilisateurService;
import mr.bmci.gestioncommandesbackend.domaine.Utilisateur;
import mr.bmci.gestioncommandesbackend.web.dto.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/me")
public class ProfileController {

    private final UtilisateurService utilisateurService;
    private final PasswordEncoder passwordEncoder;

    public ProfileController(UtilisateurService utilisateurService, PasswordEncoder passwordEncoder) {
        this.utilisateurService = utilisateurService;
        this.passwordEncoder = passwordEncoder;
    }

    // GET /api/me : profil courant
    @GetMapping
    public ResponseEntity<UtilisateurProfileDto> getMe(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) return ResponseEntity.status(401).build();

        String subject = jwt.getSubject(); // ex: matricule "21000"
        Utilisateur u = utilisateurService.findByMatricule(subject)
                .orElse(null);
        if (u == null) return ResponseEntity.status(404).build();

        return ResponseEntity.ok(toDto(u));
    }

    // PUT /api/me : mettre à jour nom/prenom/email
    @PutMapping
    public ResponseEntity<UtilisateurProfileDto> updateMe(@AuthenticationPrincipal Jwt jwt,
                                                          @RequestBody @Valid UpdateProfileRequest req) {
        if (jwt == null) return ResponseEntity.status(401).build();

        String subject = jwt.getSubject();
        Utilisateur u = utilisateurService.findByMatricule(subject)
                .orElse(null);
        if (u == null) return ResponseEntity.status(404).build();

        u.setNom(req.getNom());
        u.setPrenom(req.getPrenom());
        u.setEmail(req.getEmail());


        Utilisateur saved = utilisateurService.updateProfile(subject,req.getNom(),req.getPrenom(),req.getEmail()); // réutilise ta méthode de service

        return ResponseEntity.ok(toDto(saved));
    }

    // PATCH /api/me/password : changer le mot de passe
    @PatchMapping("/password")
    public ResponseEntity<Void> changePassword(@AuthenticationPrincipal Jwt jwt,
                                               @RequestBody @Valid ChangePasswordRequest req) {
        if (jwt == null) return ResponseEntity.status(401).build();

        String subject = jwt.getSubject();
        Utilisateur u = utilisateurService.findByMatricule(subject)
                .orElse(null);
        if (u == null) return ResponseEntity.status(404).build();

        // vérifier ancien mot de passe
        if (!passwordEncoder.matches(req.getOldPassword(), u.getMdp_hash())) {
            return ResponseEntity.status(400).build(); // ancien mdp incorrect
        }

        // encoder le nouveau mot de passe
        String newHash = passwordEncoder.encode(req.getNewPassword());
        u.Changermdp(newHash);
        utilisateurService.updateProfile(u.getMatricule(),u.getNom(),u.getPrenom(),u.getEmail());

        return ResponseEntity.noContent().build();
    }

    // Mapper
    private UtilisateurProfileDto toDto(Utilisateur u) {
        UtilisateurProfileDto dto = new UtilisateurProfileDto();
        dto.setId(u.getId());
        dto.setMatricule(u.getMatricule());
        dto.setNom(u.getNom());
        dto.setPrenom(u.getPrenom());
        dto.setEmail(u.getEmail());
        dto.setRole(u.getRole() != null ? u.getRole().getName() : null);
        dto.setResponsableId(u.getResponsable() != null ? u.getResponsable().getId() : null);
        return dto;
    }
}
