package mr.bmci.gestioncommandesbackend.web;


import mr.bmci.gestioncommandesbackend.application.CommandeService;
import mr.bmci.gestioncommandesbackend.domaine.Commande;
import mr.bmci.gestioncommandesbackend.web.dto.CommandeDto;
import mr.bmci.gestioncommandesbackend.web.dto.CreateCommandeRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping("/api/commandes")
public class CommandeController {

    private final CommandeService commandeService;

    public CommandeController(CommandeService commandeService) {
        this.commandeService = commandeService;
    }

    // --- GET all commandes ---
    @GetMapping
    public ResponseEntity<List<CommandeDto>> getCommandes(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) return ResponseEntity.status(401).build();

        String matricule = String.valueOf(jwt.getSubject());
        Object roleClaim = jwt.getClaims().get("role");     // don't cast to char[]
        String role = roleClaim != null ? roleClaim.toString() : null;

        if ("Utilisateur_simple".equals(role)) {
            // Only own orders
            List<CommandeDto> mine = commandeService.getByUtilisateurMatricule(matricule)
                    .stream()
                    .map(this::toDTO)
                    .toList();
            return ResponseEntity.ok(mine);
        }

        if ("Directeur_admin".equals(role)) {
            // <<<<<< Exclure EN_ATTENTE pour le DA
            List<CommandeDto> daView = commandeService.getAllForDAExcludingPending()
                    .stream().map(this::toDTO).toList();
            return ResponseEntity.ok(daView);
        }

        // Other roles (admin/director)
        List<CommandeDto> all = commandeService.getAllCommandes()
                .stream()
                .map(this::toDTO)
                .toList();
        return ResponseEntity.ok(all);
    }


    // --- GET by ID ---
    @GetMapping("/{id}")
    public ResponseEntity<CommandeDto> getCommandeById(@PathVariable Long id) {
        return commandeService.getCommandeById(id)
                .map(this::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // --- CREATE ---
    @PostMapping
    public ResponseEntity<CommandeDto> createCommande(@RequestBody CreateCommandeRequest req,
                                                      @AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) return ResponseEntity.status(401).build();
        String matricule = String.valueOf(jwt.getSubject()); // "sub" = "21000"
        Commande saved = commandeService.createCommandeForUser(matricule, req.getArticle_id(), req.getQuantite());
        return ResponseEntity.ok(toDTO(saved));
    }


    // --- UPDATE ---
    @PutMapping("/{id}")
    public ResponseEntity<CommandeDto> updateCommande(@PathVariable Long id,
                                                      @RequestBody CreateCommandeRequest req,
                                                      @AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) return ResponseEntity.status(401).build();
        String role = String.valueOf(jwt.getClaim("role"));
        if ("Utilisateur_simple".equals(role)) {
            return ResponseEntity.status(403).build();
        }

        return commandeService.getCommandeById(id)
                .map(existing -> {
                    Commande updated = commandeService.updateCommandeForUser(existing, req.getArticle_id(), req.getQuantite());
                    return ResponseEntity.ok(toDTO(updated));
                })
                .orElse(ResponseEntity.notFound().build());
    }



    // --- DELETE ---
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCommande(@PathVariable Long id) {
        commandeService.deleteCommande(id);
        return ResponseEntity.noContent().build();
    }

    // --- Mappers ---
    private CommandeDto toDTO(Commande c) {
        CommandeDto dto = new CommandeDto();
        dto.setId(c.getId());
        dto.setEtatCommandeId(c.getEtatCommande() != null ? c.getEtatCommande().getId() : 0);
        dto.setDate(c.getDate());
        dto.setMotifRejet(c.getMotifRejet());
        dto.setArticle_id(c.getArticle() != null ? c.getArticle().getId() : 0);
        dto.setQuantite(c.getQuantite());
        dto.setEnstock(c.isEnstock());
        dto.setUtilisateur_matricule(c.getUtilisateur().getMatricule());
        return dto;
    }

    @PatchMapping("/{id}/recue")
    public ResponseEntity<CommandeDto> markCommandeRecue(@PathVariable Long id,
                                                         @AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) return ResponseEntity.status(401).build();
        String userMatricule = String.valueOf(jwt.getSubject());

        Commande updated = commandeService.markRecueForUser(id, userMatricule);
        return ResponseEntity.ok(toDTO(updated));
    }

    // CommandeController.java
    @GetMapping("/mine")
    public ResponseEntity<List<CommandeDto>> getMyCommandes(@AuthenticationPrincipal Jwt jwt) {
        
        if (jwt == null) return ResponseEntity.status(401).build();
        String matricule = String.valueOf(jwt.getSubject());
        List<Commande> list = commandeService.getByUtilisateurMatricule(matricule); // ton service
        List<CommandeDto> dtos = list.stream().map(this::toDTO).toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/managed")
    public ResponseEntity<List<CommandeDto>> getManaged(@AuthenticationPrincipal Jwt jwt) {
        String managerId = String.valueOf(jwt.getSubject());
        List<CommandeDto> list = commandeService.getManagedBy(managerId).stream().map(this::toDTO).toList();
        return ResponseEntity.ok(list);
    }

    // --- valider
    @PutMapping("/{id}/manager/valider")
    public ResponseEntity<CommandeDto> managerValider(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        String managerId = String.valueOf(jwt.getSubject());
        Commande c = commandeService.managerValidate(managerId, id);
        return ResponseEntity.ok(toDTO(c));
    }

    // --- rejeter avec motif
    public static record RejectRequest(String motif) {}
    @PutMapping("/{id}/manager/rejeter")
    public ResponseEntity<CommandeDto> managerRejeter(@PathVariable Long id,
                                                      @RequestBody rejectRequest req,
                                                      @AuthenticationPrincipal Jwt jwt) {
        String managerId = String.valueOf(jwt.getSubject());
        Commande c = commandeService.managerReject(managerId, id, req.motif());
        return ResponseEntity.ok(toDTO(c));
    }

    // --- modifier (article/quantité)
    public static record ManagerUpdateRequest(Long article_id, Integer quantite) {}
    @PutMapping("/{id}/manager")
    public ResponseEntity<CommandeDto> managerUpdate(@PathVariable Long id,
                                                     @RequestBody ManagerUpdateRequest req,
                                                     @AuthenticationPrincipal Jwt jwt) {
        String managerId = String.valueOf(jwt.getSubject());
        Commande c = commandeService.managerUpdate(managerId, id, req.article_id(), req.quantite());
        return ResponseEntity.ok(toDTO(c));
    }


    @PutMapping("/{id}/valider-da")
    @Transactional
    public ResponseEntity<?> daValider(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) return ResponseEntity.status(401).build();
        Object roleClaim = jwt.getClaims().get("role");     // don't cast to char[]
        String role = roleClaim != null ? roleClaim.toString() : null;
        if (!"Directeur_admin".equals(role)) return ResponseEntity.status(403).build();

        try {
            Commande updated = commandeService.daValidateAndDecreaseStock(id);
            return ResponseEntity.ok(updated);
        }catch (Exception e) {

            return ResponseEntity.status(409).body("Stock insuffisant");
        }



    }

    public record rejectRequest(String motif) {}
    @PutMapping("/{id}/rejeter-da")

    public ResponseEntity<CommandeDto> daReject(@PathVariable Long id,
                                                @RequestBody rejectRequest req,
                                                @AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) return ResponseEntity.status(401).build();
        Object roleClaim = jwt.getClaims().get("role");     // don't cast to char[]
        String role = roleClaim != null ? roleClaim.toString() : null;
        if (!"Directeur_admin".equals(role)) return ResponseEntity.status(403).build();

        Commande updated = commandeService.daReject(id, req.motif());
        return ResponseEntity.ok(toDTO(updated));
    }

}
