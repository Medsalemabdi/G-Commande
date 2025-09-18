package mr.bmci.gestioncommandesbackend.domaine;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "etatcommande")
@Getter @Setter
public class EtatCommande {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "nom")
    private String nom;

    @OneToMany(mappedBy = "etatCommande",fetch = FetchType.LAZY,cascade = CascadeType.PERSIST)
    private List<Commande> commandes;
}
