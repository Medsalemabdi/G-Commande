import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { UserService } from '../user.service';
import { AuthService, SignupDto } from '../auth/services/auth.service';
import { ProfileService, UtilisateurProfileDto } from '../dashboardUser/profile.service';

import { Role } from '../models/role.model';
import { User } from '../models/user.model';

type AdminTab = 'dashboard' | 'users' | 'profile';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-comptes.component.html'
})
export class GestionComptesComponent implements OnInit {
  // UI / navigation
  activeSection: AdminTab = 'dashboard';
  mobileMenuOpen = false;
  isMobile = window.innerWidth < 768;

  // Données
  users: User[] = [];
  filteredUsers: User[] = [];
  roles: Role[] = [];
  managers: User[] = [];

  // Création user (template-driven)
  showSignupForm = false;
  isLoading = true;
  isCreatingUser = false;
  errorMsg: string | null = null;
  successMsg: string | null = null;

  newUser = {
    username: '',
    nom: '',
    prenom: '',
    email: '',
    password: '',
    roleId: null as number | null,
    managerId: null as number | null
  };

  // Filtres (template-driven)
  filters = {
    search: '',
    roleId: '' as '' | number,
    managerId: '' as '' | number
  };

  // Profil
  me: UtilisateurProfileDto | null = null;
  profileSaving = false;
  passwordSaving = false;
  profileMsg: string | null = null;
  passwordMsg: string | null = null;

  // Profil edit buffer (ngModel)
  profileForm = { nom: '', prenom: '', email: '' };
  passwordForm = { oldPassword: '', newPassword: '', confirmNewPassword: '' };

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private profileApi: ProfileService
  ) {}

  ngOnInit(): void {
    window.addEventListener('resize', this.onResize);
    this.loadEverything();
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResize);
  }

  private onResize = () => { this.isMobile = window.innerWidth < 768; };

  setSection(s: AdminTab) {
    this.activeSection = s;
    this.mobileMenuOpen = false;
    this.successMsg = null;
    this.errorMsg = null;
  }
  toggleMobileMenu() { this.mobileMenuOpen = !this.mobileMenuOpen; }

  // ===== Load =====
  private loadEverything() {
    this.isLoading = true;
    forkJoin({
      users: this.userService.getAllUsers(),
      roles: this.userService.getAllRoles(),
      managers: this.userService.getManagers()
    }).subscribe({
      next: ({ users, roles, managers }) => {
        this.users = users ?? [];
        this.roles = roles ?? [];
        this.managers = managers ?? [];
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.errorMsg = 'Erreur lors du chargement des données.';
        this.isLoading = false;
      }
    });

    this.profileApi.getMe().subscribe({
      next: (me) => {
        this.me = me;
        this.profileForm = {
          nom: me.nom ?? '',
          prenom: me.prenom ?? '',
          email: me.email ?? ''
        };
      }
    });
  }

  // ===== Helpers rôles / managers =====
  getRoleName(role: Role): string {
    const r = this.roles.find(x => x.id === role.id);
    return r ? r.name : 'Inconnu';
  }
  getRoleDisplayName(role: Role): string {
    const name = this.getRoleName(role);
    switch (name) {
      case 'Admin': return 'Administrateur';
      case 'Manager': return 'Manager';
      case 'Utilisateur_simple': return 'Utilisateur';
      default: return name;
    }
  }
  getRoleNameById(roleId: number | null): string {
    if (!roleId) return '';
    const r = this.roles.find(x => x.id === roleId);
    return r ? r.name : '';
  }
  getManagerName(manager: User): string {
    const m = this.managers.find(x => x.id === manager.id);
    return m ? m.nom : 'Non assigné';
  }

  // ===== Filtres =====
  applyFilters() {
    const { search, roleId, managerId } = this.filters;
    const s = (search || '').toLowerCase();

    this.filteredUsers = (this.users ?? []).filter(u => {
      const matchSearch =
        !s ||
        u.matricule.toLowerCase().includes(s) ||
        u.nom.toLowerCase().includes(s) ||
        u.prenom.toLowerCase().includes(s) ||
        (u.email || '').toLowerCase().includes(s);

      const matchRole = !roleId || u.role?.id === roleId;
      const matchManager = !managerId || u.responsable?.id === managerId;

      return matchSearch && matchRole && matchManager;
    });
  }

  // ===== Création utilisateur =====
  toggleSignupForm() {
    this.showSignupForm = !this.showSignupForm;
    this.successMsg = null;
    this.errorMsg = null;
    if (!this.showSignupForm) this.resetNewUser();
  }

  private resetNewUser() {
    this.newUser = {
      username: '',
      nom: '',
      prenom: '',
      email: '',
      password: '',
      roleId: null,
      managerId: null
    };
  }

  canSubmitNewUser(): boolean {
    const n = this.newUser;
    const baseOk = !!n.username && n.username.length >= 3
      && !!n.nom && n.nom.length >= 2
      && !!n.prenom && n.prenom.length >= 2
      && !!n.email
      && !!n.password && n.password.length >= 6
      && !!n.roleId;

    const selectedRole = this.roles.find(r => r.id === n.roleId);
    if (selectedRole?.name === 'Utilisateur_simple') {
      return baseOk && !!n.managerId;
    }
    return baseOk;
    }
  
  submitNewUser() {
    if (!this.canSubmitNewUser()) return;

    this.isCreatingUser = true;
    this.successMsg = null;
    this.errorMsg = null;

    const selectedRole = this.roles.find(r => r.id === this.newUser.roleId);
    if (!selectedRole) {
      this.isCreatingUser = false;
      this.errorMsg = 'Rôle invalide.';
      return;
    }

    const dto: SignupDto = {
      username: this.newUser.username,
      nom:      this.newUser.nom,
      prenom:   this.newUser.prenom,
      email:    this.newUser.email,
      password: this.newUser.password,
      role:     selectedRole.name,
      managerId: this.newUser.managerId ?? undefined
    };

    this.authService.signup(dto).subscribe({
      next: (resp) => {
        const created = (resp as any)?.body ?? resp; // compat backend
        if (created) this.users = [...this.users, created];
        this.applyFilters();

        this.successMsg = 'Utilisateur créé avec succès.';
        this.isCreatingUser = false;
        this.showSignupForm = false;
        this.resetNewUser();
      },
      error: (err) => {
        this.isCreatingUser = false;
        this.errorMsg = err?.status === 409
          ? 'Ce matricule est déjà utilisé.'
          : 'Erreur lors de la création de l’utilisateur.';
      }
    });
  }

  // ===== Suppression =====
  deleteUser(userId: number) {
    if (!confirm('Supprimer cet utilisateur ?')) return;

    this.userService.deleteUser(userId).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== userId);
        this.applyFilters();
        this.successMsg = 'Utilisateur supprimé.';
      },
      error: () => {
        this.errorMsg = 'Erreur lors de la suppression.';
      }
    });
  }

  // ===== Profil =====
  saveProfile() {
    if (!this.me) return;
    this.profileSaving = true;
    this.profileMsg = null;

    this.profileApi.updateMe(this.profileForm).subscribe({
      next: (me) => {
        this.me = me;
        this.profileSaving = false;
        this.profileMsg = 'Profil mis à jour.';
      },
      error: () => {
        this.profileSaving = false;
        this.profileMsg = 'Erreur lors de la mise à jour.';
      }
    });
  }

  changePassword() {
    const { oldPassword, newPassword, confirmNewPassword } = this.passwordForm;
    if (!oldPassword || !newPassword || newPassword.length < 6) return;
    if (newPassword !== confirmNewPassword) {
      this.passwordMsg = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.passwordSaving = true;
    this.passwordMsg = null;

    this.profileApi.changePassword({ oldPassword, newPassword }).subscribe({
      next: () => {
        this.passwordSaving = false;
        this.passwordMsg = 'Mot de passe changé.';
        this.passwordForm = { oldPassword: '', newPassword: '', confirmNewPassword: '' };
      },
      error: (err) => {
        this.passwordSaving = false;
        this.passwordMsg = err?.status === 400
          ? 'Ancien mot de passe incorrect.'
          : 'Erreur lors du changement de mot de passe.';
      }
    });
  }
}
