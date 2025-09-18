
package mr.bmci.gestioncommandesbackend.web.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class SignupRequest {

    @NotBlank
    private String username;
    @NotBlank
    private String role;

    private String nom;
    private String prenom;
    private String email;

    @NotBlank @Size(min = 6)
    private String password;
    
    private Long managerId;

    public String getRole() { return role; }
    public void setRole(String r) { this.role = r; }


}
