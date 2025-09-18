package mr.bmci.gestioncommandesbackend.web.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter @AllArgsConstructor
public class StockDto {

    private Long id;
    private Long article_id;
    private int quantite;

}
