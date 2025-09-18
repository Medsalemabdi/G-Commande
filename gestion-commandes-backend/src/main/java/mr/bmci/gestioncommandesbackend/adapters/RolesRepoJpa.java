package mr.bmci.gestioncommandesbackend.adapters;

import mr.bmci.gestioncommandesbackend.domaine.Role;
import mr.bmci.gestioncommandesbackend.ports.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

interface SpringDataRoleRepo extends JpaRepository<Role,Long>{
    List<Role> findAll();

    Role findByName(String role);
}
@Repository
public class RolesRepoJpa implements RoleRepository {
    private final SpringDataRoleRepo jpa;

    @Autowired
    public RolesRepoJpa(SpringDataRoleRepo jpa) {
        this.jpa = jpa;
    }

    @Override
    public List<Role> getRoles() {
        return jpa.findAll();
    }

    @Override
    public Role getRoleByName(String role) {
        return jpa.findByName(role);
    }

}
