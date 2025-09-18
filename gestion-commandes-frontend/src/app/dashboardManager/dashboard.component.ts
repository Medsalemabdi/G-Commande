// src/app/dashboardManager/dashboard.component.ts
import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ArticleService, Article } from '../dashboardDirecteur/gestion-articles/article.service';
import { CommandeManagerService } from '../dashboardManager/commande-manager.service';
import { CommandeDto } from '../models/commande.model';
import { ProfileService, UpdateProfileRequest, ChangePasswordRequest } from '../dashboardUser/profile.service';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  imports: [CommonModule, ReactiveFormsModule, DatePipe]
})
export class ManagerDashboardComponent implements OnInit {
  activeSection: 'dashboard' | 'team' | 'profile' = 'team';
  mobileMenuOpen = false;
  isMobile = window.innerWidth < 768;

  // Données
  managedCommandes: CommandeDto[] = [];
  teamLoading = false;
  teamError: string | null = null;

  articles: Article[] = [];
  articlesLoading = false;
  articlesError: string | null = null;

  // Stats
  stats = { total: 0, pending: 0 };
  lastOrderDate?: Date;

  // Dashboard par état
  statsByState = { en_attente: 0, validee: 0, rejetee: 0, recue: 0 };
  rejectedOrders: Array<{ id: number; date: string | Date; articleNom: string; quantite: number; motifRejet?: string | null }> = [];

  // Edition inline
  editingTeamId?: number;
  teamForm!: FormGroup;        // <-- sera créé dans ngOnInit

  // Profil
  profileForm!: FormGroup;     // <-- sera créé dans ngOnInit
  passwordForm!: FormGroup;    // <-- sera créé dans ngOnInit
  profileSaving = false;
  passwordSaving = false;
  profileMsg: string | null = null;
  passwordMsg: string | null = null;
  me: { matricule?: string; role?: string; nom?: string; prenom?: string; email?: string } | null = null;

  // Etats
  readonly ETAT = { EN_ATTENTE: 5, RECUE: 1, EN_COURS: 2, LIVRAISON: 3, REJETEE: 4 } as const;

  constructor(
    private fb: FormBuilder,
    private articleApi: ArticleService,
    private commandesApi: CommandeManagerService,
    private profileApi: ProfileService
  ) {}

  ngOnInit(): void {
    // ✅ Crée les FormGroup ICI (après que this.fb soit dispo)
    this.teamForm = this.fb.nonNullable.group({
      // number non-nullables + validators
      article_id: this.fb.nonNullable.control<number>(0, { validators: [Validators.required] }),
      quantite: this.fb.nonNullable.control<number>(1, { validators: [Validators.required, Validators.min(1)] }),
    });

    this.profileForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });

    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword: ['', Validators.required],
    });

    this.fetchArticles();
    this.loadTeamCommandes();
    this.loadProfile();
  }

  @HostListener('window:resize') onResize() { this.isMobile = window.innerWidth < 768; }
  toggleMobileMenu() { this.mobileMenuOpen = !this.mobileMenuOpen; }
  setSection(s: 'dashboard' | 'team' | 'profile') { this.activeSection = s; this.mobileMenuOpen = false; }

  // ======== Helpers UI ========
  statusLabel(id?: number) {
    if (!id || id === 0) return 'En attente';
    switch (id) {
      case 1: return 'Recue';
      case 2: return 'En cours';
      case 3: return 'En cours de livraison';
      case 4: return 'Rejetée';
      case 5: return 'En attente';
      default: return `État #${id}`;
    }
  }
  statusClass(id?: number) {
    if (!id || id === this.ETAT.EN_ATTENTE) return 'text-yellow-600';
    switch (id) {
      case this.ETAT.RECUE:     return 'text-blue-700';
      case this.ETAT.EN_COURS:  return 'text-indigo-700';
      case this.ETAT.LIVRAISON: return 'text-purple-700';
      case this.ETAT.REJETEE:   return 'text-red-600';
      default:                  return 'text-gray-600';
    }
  }
  articleName(id?: number) {
    if (!id) return '-';
    const a = this.articles.find(x => x.id === id);
    return a?.nom ?? `#${id}`;
  }
  humanizeError(err: any): string {
    if (err?.error?.message) return err.error.message;
    if (typeof err === 'string') return err;
    return 'Une erreur est survenue. Veuillez réessayer.';
  }

  // ======== Chargements ========
  fetchArticles() {
    this.articlesLoading = true; this.articlesError = null;
    this.articleApi.getArticles().subscribe({
      next: as => { this.articles = as; this.articlesLoading = false; },
      error: err => { this.articlesError = this.humanizeError(err); this.articlesLoading = false; }
    });
  }

  loadTeamCommandes() {
    this.teamLoading = true; this.teamError = null;
    // ⚠️ utilise bien l’endpoint manager côté service (ex: /api/commandes/managed)
    this.commandesApi.getManaged().subscribe({
      next: list => {
        this.managedCommandes = list ?? [];
        this.teamLoading = false;
        this.computeTopStats();          // Total / pending / last
        this.computeDashboardBreakdown(); // par état + rejetées
      },
      error: err => { this.teamLoading = false; this.teamError = this.humanizeError(err); }
    });
  }

  private computeTopStats() {
    this.stats.total = this.managedCommandes.length;
    this.stats.pending = this.managedCommandes.filter(c => (c.etatCommandeId ?? 0) === this.ETAT.EN_ATTENTE).length;

    const last = this.managedCommandes
      .map(c => (c.date ? new Date(c.date) : undefined))
      .filter((d): d is Date => !!d)
      .sort((a, b) => b.getTime() - a.getTime())[0];
    this.lastOrderDate = last;
  }

  private computeDashboardBreakdown() {
    let en_attente = 0, en_cours = 0, livraison = 0, rejetee = 0, recue = 0;
    this.rejectedOrders = [];

    for (const o of this.managedCommandes) {
      const etat = o.etatCommandeId ?? 0;
      if (etat === this.ETAT.RECUE) recue++;
      else if (etat === this.ETAT.EN_COURS) en_cours++;
      else if (etat === this.ETAT.LIVRAISON) livraison++;
      else if (etat === this.ETAT.REJETEE) {
        rejetee++;
        this.rejectedOrders.push({
          id: o.id!, date: o.date ?? '', articleNom: this.articleName(o.article_id),
          quantite: o.quantite, motifRejet: (o as any).motifRejet ?? null
        });
      } else en_attente++;
    }

    this.statsByState = {
      en_attente,
      validee: en_cours + livraison,
      rejetee,
      recue,
    };
  }

  // ======== Édition inline ========
  startEditTeam(c: CommandeDto) {
    this.editingTeamId = c.id;
    this.teamForm.setValue({
      article_id: c.article_id ?? 0,   // ✅ nombre
      quantite: c.quantite ?? 1
    });
  }
  cancelEditTeam() { this.editingTeamId = undefined; }

  saveEditTeam() {
    if (!this.editingTeamId || this.teamForm.invalid) return;
    const payload = {
      article_id: Number(this.teamForm.value.article_id),
      quantite: Number(this.teamForm.value.quantite),
    };
    this.commandesApi.update(this.editingTeamId, payload).subscribe({
      next: _ => { this.editingTeamId = undefined; this.loadTeamCommandes(); },
      error: err => { this.teamError = this.humanizeError(err); }
    });
  }

  managerValidate(c: CommandeDto) {
    if (!c.id) return;
    this.commandesApi.validate(c.id).subscribe({
      next: _ => this.loadTeamCommandes(),
      error: err => this.teamError = this.humanizeError(err)
    });
  }
  managerReject(c: CommandeDto) {
    if (!c.id) return;
    const motif = prompt('Motif de rejet ?') ?? '';
    this.commandesApi.reject(c.id,  motif ).subscribe({
      next: _ => this.loadTeamCommandes(),
      error: err => this.teamError = this.humanizeError(err)
    });
  }

  // ======== Profil ========
  loadProfile() {
    this.profileApi.getMe().subscribe({
      next: me => {
        this.me = me;
        this.profileForm.patchValue({
          nom: me?.nom ?? '',
          prenom: me?.prenom ?? '',
          email: me?.email ?? '',
        });
      }
    });
  }

  submitProfile() {
    if (this.profileForm.invalid) return;
    this.profileSaving = true; this.profileMsg = null;

    // ✅ Construire un objet typé non-null
    const body: UpdateProfileRequest = {
      nom: this.profileForm.value.nom ?? '',
      prenom: this.profileForm.value.prenom ?? '',
      email: this.profileForm.value.email ?? ''
    };

    this.profileApi.updateMe(body).subscribe({
      next: me => { this.me = me; this.profileSaving = false; this.profileMsg = 'Profil mis à jour.'; },
      error: _ => { this.profileSaving = false; this.profileMsg = 'Erreur lors de la mise à jour.'; }
    });
  }

  submitPassword() {
    if (this.passwordForm.invalid) return;
    const { oldPassword, newPassword, confirmNewPassword } = this.passwordForm.value;
    if (newPassword !== confirmNewPassword) { this.passwordMsg = 'Les mots de passe ne correspondent pas.'; return; }

    this.passwordSaving = true; this.passwordMsg = null;

    // ✅ Construire un objet typé non-null
    const body: ChangePasswordRequest = {
      oldPassword: oldPassword ?? '',
      newPassword: newPassword ?? ''
    };

    this.profileApi.changePassword(body).subscribe({
      next: _ => { this.passwordSaving = false; this.passwordMsg = 'Mot de passe changé.'; this.passwordForm.reset(); },
      error: err => {
        this.passwordSaving = false;
        this.passwordMsg = err?.status === 400 ? 'Ancien mot de passe incorrect.' : 'Erreur lors du changement de mot de passe.';
      }
    });
  }

  userLabel(c: CommandeDto): string {
  // On tente plusieurs formes possibles selon ce que renvoie le backend
  const anyRow = c as any;
  return (
    anyRow?.utilisateurMatricule ??
    anyRow?.utilisateur?.matricule ??
    anyRow?.utilisateur_matricule ??
    anyRow?.userId ??
    '—'
  );
}
}
