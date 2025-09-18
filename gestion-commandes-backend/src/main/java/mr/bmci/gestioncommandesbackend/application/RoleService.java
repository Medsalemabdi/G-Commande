package mr.bmci.gestioncommandesbackend.application;

import mr.bmci.gestioncommandesbackend.domaine.Role;
import mr.bmci.gestioncommandesbackend.ports.RoleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class RoleService {
    private RoleRepository repo;

    public RoleService(RoleRepository repo) {
        this.repo = repo;
    }
    public List<Role> getRoles(){
        return repo.getRoles();
    }

    public Role getByName(String role) {
        return repo.getRoleByName(role);
    }

    public Role findByName(String role) {
       return repo.getRoleByName(role);
    }
}
