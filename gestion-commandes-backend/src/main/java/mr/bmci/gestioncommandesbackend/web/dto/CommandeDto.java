package mr.bmci.gestioncommandesbackend.web.dto;

import lombok.Data;

import java.time.LocalDate;
@Data
public class CommandeDto {
    private Long id;
    private Long etatCommandeId;
    private LocalDate date;
    private String motifRejet;
    private Long article_id;
    private int quantite;
    private boolean enstock;
    private String utilisateur_matricule;

}
