package mr.bmci.gestioncommandesbackend.domaine;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;
@Entity
@Table(name = "categorie")
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Categorie {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private int id;

    @Column(unique=true, nullable=false)
    private String nom;


}
