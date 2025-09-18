package mr.bmci.gestioncommandesbackend.domaine;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;



@Entity
@Table(name = "roles")
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String name;


}
