// src/main/java/mr/bmci/gestioncommandesbackend/web/dto/ChangePasswordRequest.java
package mr.bmci.gestioncommandesbackend.web.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChangePasswordRequest {
    @NotBlank
    private String oldPassword;
    @NotBlank
    private String newPassword;
}
