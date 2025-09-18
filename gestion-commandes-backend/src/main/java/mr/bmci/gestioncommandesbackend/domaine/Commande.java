package mr.bmci.gestioncommandesbackend.domaine;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "commandes")
@Data
public class Commande {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "etat_id")
    private EtatCommande etatCommande;

    @Column(name = "date",nullable = false)
    private LocalDate date;

    @Column(name = "motifRejet")
    private String motifRejet;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "article_id", nullable = false)
    private Article article;


    @Column(name = "quantite",nullable = false)
    @NotNull
    private int quantite;

    @Column(name = "enstock")
    private boolean enstock;

    @ManyToOne(fetch = FetchType.LAZY, optional=false)
    @JoinColumn(name="utilisateur_id")
    private Utilisateur utilisateur;



}
