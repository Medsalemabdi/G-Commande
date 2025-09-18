package mr.bmci.gestioncommandesbackend.web.dto;

import lombok.Data;

@Data
public class CreateCommandeRequest {
    private Long article_id;
    private int quantite;
}
