package mr.bmci.gestioncommandesbackend.domaine;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Entity
@Table(name = "utilisateur")
@Data
public class Utilisateur {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique=true, nullable=false)
    @NotBlank
    private String matricule;

    @Column
    private String nom;

    @Column
    private String prenom;

    @Column
    private String email;


    @Column(name = "mdp_hash",nullable=false)
    @NotBlank
    private String mdp_hash;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id")
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsable_id")
    private Utilisateur responsable;

    public void Changermdp(String mdp){
        setMdp_hash(mdp);
    }
}


