// src/main/java/mr/bmci/gestioncommandesbackend/web/dto/UtilisateurProfileDto.java
package mr.bmci.gestioncommandesbackend.web.dto;

import lombok.Data;

@Data
public class UtilisateurProfileDto {
    private Long id;
    private String matricule;
    private String nom;
    private String prenom;
    private String email;
    private String role;          // nom du rôle lisible
    private Long responsableId;   // optionnel
}
