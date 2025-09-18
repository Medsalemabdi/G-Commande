package mr.bmci.gestioncommandesbackend.web.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ArticleDto {
    String nom;
    Long categorie_id;
    String description;
}
