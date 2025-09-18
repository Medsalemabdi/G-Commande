package mr.bmci.gestioncommandesbackend.web.dto;

import lombok.*;

@Getter @Setter @AllArgsConstructor @NoArgsConstructor
public class TokenResponse {
    private String token;
    private String role;
}
