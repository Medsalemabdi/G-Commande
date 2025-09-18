package mr.bmci.gestioncommandesbackend.ports;

import mr.bmci.gestioncommandesbackend.domaine.Role;

import java.util.List;

public interface RoleRepository {
    List<Role> getRoles();

    Role getRoleByName(String role);
}
