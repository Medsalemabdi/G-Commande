package mr.bmci.gestioncommandesbackend.domaine;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "stock")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Stock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private int quantite;

    /** Référence inverse vers l’article */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id", nullable = false)
    private Article article;

    /** Réserve une quantité, lève si rupture */
    public void reserver(int qt) {
        if (qt > quantite) {
            throw new IllegalStateException("Stock insuffisant");
        }
        this.quantite -= qt;
    }


}
