package mr.bmci.gestioncommandesbackend.web.dto;


import lombok.*;
import jakarta.validation.constraints.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Data
public class LoginRequest {
    @NotBlank private String username;
    @NotBlank private String password;
}
