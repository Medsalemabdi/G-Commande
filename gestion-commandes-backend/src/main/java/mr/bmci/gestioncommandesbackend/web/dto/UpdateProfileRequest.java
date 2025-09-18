// src/main/java/mr/bmci/gestioncommandesbackend/web/dto/UpdateProfileRequest.java
package mr.bmci.gestioncommandesbackend.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @NotBlank
    private String nom;
    @NotBlank
    private String prenom;
    @Email
    private String email;
}
