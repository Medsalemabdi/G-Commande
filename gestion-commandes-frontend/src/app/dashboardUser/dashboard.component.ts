// src/app/dashboardUser/dashboard.component.ts
import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommandeService } from './commande.service';
import { CommandeDto, CreateCommandePayload } from '../models/commande.model';
import { ArticleService, Article } from '../dashboardDirecteur/gestion-articles/article.service';
import { UtilisateurProfileDto, ProfileService } from './profile.service';

// ---- Types & constantes hors classe (TS ne permet pas de déclarer un type dans la classe)
type StatsByState = {
  en_attente: number;
  validee: number;  // "validee" = EN_COURS + LIVRAISON
  rejetee: number;
  recue: number;
};

interface Categorie { id: number; nom: string; }




@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  imports: [CommonModule, ReactiveFormsModule, DatePipe]
})
export class UserDashboardComponent implements OnInit {
  activeSection: 'dashboard' | 'orders' | 'profile' = 'orders';
  mobileMenuOpen = false;
  isMobile = window.innerWidth < 768;

  commandes: CommandeDto[] = [];
  loading = false;
  error: string | null = null;

  articles: Article[] = [];
  articlesLoading = false;
  articlesError: string | null = null;

  stats = { total: 0, pending: 0 };
  lastOrderDate?: Date;

  orderForm!: FormGroup;
  showForm = false;
  editMode = false;
  editingId?: number;
  userRole: string | null = null;

  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  me: UtilisateurProfileDto | null = null;
  profileSaving = false;
  passwordSaving = false;
  profileMsg: string | null = null;
  passwordMsg: string | null = null;

  categories: Categorie[] = [];
  categoriesLoading = false;
  categoriesError = '';

  articlesByCat: Article[] = [];



  // === Mapping des états (doit refléter l’API)
  readonly ETAT = {
    EN_ATTENTE: 0,
    RECUE: 1,
    EN_COURS: 2,
    LIVRAISON: 3,   // "En cours de livraison"
    REJETEE: 4,
  } as const;

  // Compteurs par état (affichés sur le dashboard)
  statsByState: StatsByState = {
    en_attente: 0,
    validee: 0,
    rejetee: 0,
    recue: 0,
  };

  // Liste des commandes rejetées (pour tableau avec motif)
  rejectedOrders: Array<{
    id: number;
    date: string | Date;
    articleNom: string;
    quantite: number;
    motifRejet?: string | null;
  }> = [];

  constructor(
    private fb: FormBuilder,
    private commandesApi: CommandeService,
    private articleApi: ArticleService,
    private profileApi: ProfileService
  ) {}

  ngOnInit(): void {
    this.buildForm();          // créer une seule fois
    this.hookCategoryChange(); // brancher l'écoute
    this.buildForm();
    this.loadCommandes();     // <- unifié (utilise getMyCommandes())
    this.fetchArticles();
    this.userRole = localStorage.getItem('userRole');

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

    this.loadProfile();

    this.orderForm.get('categorie_id')?.valueChanges.subscribe((catId: number | null) => {
    this.orderForm.patchValue({ article_id: null }, { emitEvent: false });
    this.articlesByCat = [];
    if (catId) this.loadArticlesByCategorie(catId);
  });
  }

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth < 768;
  }

  setSection(s: 'dashboard' | 'orders' | 'profile') {
    this.activeSection = s;
    this.mobileMenuOpen = false;
  }

  toggleMobileMenu() { this.mobileMenuOpen = !this.mobileMenuOpen; }

  buildForm(dto?: Partial<CommandeDto>) {
    this.orderForm = this.fb.group({
      categorie_id: [null, Validators.required],
      article_id: [dto?.article_id ?? '', [Validators.required]],
      quantite: [dto?.quantite ?? 1, [Validators.required, Validators.min(1)]],
    });
  }

  openCreate() {
    this.editMode = false;
    this.editingId = undefined;
    this.error = null;
    this.showForm = true;
    this.orderForm.reset({ categorie_id: null, article_id: null, quantite: 1 });
    this.loadCategories();
  }

  openEdit(existing: any) {
  this.editMode = true;
  this.showForm = true;
  this.loadCategories(() => {
    this.orderForm.patchValue({
      categorie_id: existing.categorie_id, // si dispo côté commande
      article_id: existing.article_id,
      quantite: existing.quantite
    });
  });
}

  closeForm() { this.showForm = false; }

  submitForm() {
    if (this.orderForm.invalid) return;

    const raw = this.orderForm.value;
    const payload: CreateCommandePayload = {
      article_id: Number(raw.article_id),
      quantite: Number(raw.quantite),
    };

    this.loading = true;
    this.error = null;

    const req$ = this.editMode && this.editingId
      ? this.commandesApi.update(this.editingId, payload)
      : this.commandesApi.create(payload);

    req$.subscribe({
      next: _ => {
        this.loading = false;
        this.showForm = false;
        this.loadCommandes();  // refresh
      },
      error: err => {
        this.loading = false;
        this.error = this.humanizeError(err);
      }
    });
  }

  private hookCategoryChange() {
  this.orderForm.get('categorie_id')!.valueChanges.subscribe((catId: number | null) => {
    this.orderForm.patchValue({ article_id: null }, { emitEvent: false });
    this.articlesByCat = [];
    if (catId) this.loadArticlesByCategorie(catId);
  });
}

  confirmDelete(o: CommandeDto) {
    if (!o.id) return;
    const ok = confirm(`Supprimer la commande #${o.id} ?`);
    if (!ok) return;

    this.loading = true;
    this.commandesApi.delete(o.id).subscribe({
      next: _ => {
        this.loading = false;
        this.loadCommandes();
      },
      error: err => {
        this.loading = false;
        this.error = this.humanizeError(err);
      }
    });
  }

  private loadCategories(after?: () => void) {
  this.categoriesLoading = true;
  this.categoriesError = '';
  this.articleApi.getCategories().subscribe({
    next: (cats) => { this.categories = cats; after?.(); },
    error: (err) => { this.categoriesError = 'Impossible de charger les catégories.'; },
    complete: () => { this.categoriesLoading = false; }
  });
}

private loadArticlesByCategorie(categorieId: number) {
  this.articlesLoading = true;
  this.articlesError = '';
  this.articleApi.getArticlesByCategorie(categorieId).subscribe({
    next: (arts) => { this.articlesByCat = arts; },
    error: (err) => { this.articlesError = 'Impossible de charger les articles de cette catégorie.'; },
    complete: () => { this.articlesLoading = false; }
  });
}

  // ===== Chargements =====

  loadCommandes() {
    this.loading = true;
    this.error = null;

    
    this.commandesApi.getMyCommandes().subscribe({
      next: (list: CommandeDto[]) => {
        this.commandes = list ?? [];
        this.loading = false;
        this.computeStats();
        this.computeDashboardBreakdown();
      },
      error: (err: unknown) => {
        this.loading = false;
        this.error = this.humanizeError(err);
      }
    });
  }

  fetchArticles() {
    this.articlesLoading = true;
    this.articlesError = null;

    this.articleApi.getArticles().subscribe({
      next: (as) => {
        this.articles = as;
        this.articlesLoading = false;
      },
      error: (err) => {
        this.articlesError = this.humanizeError(err);
        this.articlesLoading = false;
      }
    });
  }

  // ===== Stats & helpers =====

  computeStats() {
    this.stats.total = this.commandes.length;
    this.stats.pending = this.commandes.filter(
      x => this.statusLabel(x.etatCommandeId).toLowerCase() === 'en attente'
    ).length;

    const last = this.commandes
      .map(x => (x.date ? new Date(x.date) : undefined))
      .filter((d): d is Date => !!d)
      .sort((a, b) => b.getTime() - a.getTime())[0];

    this.lastOrderDate = last;
  }

  statusLabel(id?: number) {
    
    switch (id) {
      case 1: return 'Recue';
      case 2: return 'En cours';
      case 3: return 'En cours de livraison';
      case 4: return 'Rejetée';
      case 5: return 'En attente';
      default: return `État #${id}`;
    }
  }

  public statusClass(id?: number): string {
    if (!id || id === this.ETAT.EN_ATTENTE) return 'text-yellow-600';
    switch (id) {
      case this.ETAT.RECUE:     return 'text-green-700';
      case this.ETAT.EN_COURS:  return 'text-blue-700';
      case this.ETAT.LIVRAISON: return 'text-purple-700';
      case this.ETAT.REJETEE:   return 'text-red-600';
      case this.ETAT.EN_ATTENTE: return 'text-yellow-600';
      default:                  return 'text-gray-600';
    }
  }

  // toujours retourner une string
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

  // ===== Actions =====

  markAsReceived(o: CommandeDto) {
    if (!o.id) return;
    this.loading = true;
    this.commandesApi.markRecue(o.id).subscribe({
      next: (updated) => {
        this.loading = false;
        // mise à jour locale
        this.commandes = this.commandes.map(c => c.id === updated.id ? updated : c);
        this.computeStats();
        this.computeDashboardBreakdown();
      },
      error: (err) => {
        this.loading = false;
        this.error = this.humanizeError(err);
      }
    });
  }

  // ===== Profil =====

  loadProfile() {
    this.profileApi.getMe().subscribe({
      next: (me) => {
        this.me = me;
        this.profileForm.patchValue({
          nom: me.nom ?? '',
          prenom: me.prenom ?? '',
          email: me.email ?? '',
        });
      },
      error: () => { /* tu peux afficher une alerte si besoin */ }
    });
  }

  submitProfile() {
    if (this.profileForm.invalid) return;
    this.profileSaving = true;
    this.profileMsg = null;

    this.profileApi.updateMe(this.profileForm.value).subscribe({
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

  submitPassword() {
    if (this.passwordForm.invalid) return;

    const { oldPassword, newPassword, confirmNewPassword } = this.passwordForm.value;
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
        this.passwordForm.reset();
      },
      error: (err) => {
        this.passwordSaving = false;
        this.passwordMsg = err?.status === 400
          ? 'Ancien mot de passe incorrect.'
          : 'Erreur lors du changement de mot de passe.';
      }
    });
  }

  // ===== Dashboard détaillé (par état + rejets) =====
  computeDashboardBreakdown() {
    // on prépare des compteurs intermédiaires pour agréger "validée"
    let en_attente = 0, en_cours = 0, livraison = 0, rejetee = 0, recue = 0;
    this.rejectedOrders = [];

    for (const o of this.commandes) {
      const etat = o.etatCommandeId ?? 0;

      if (etat === this.ETAT.RECUE) {
        recue++;
      } else if (etat === this.ETAT.EN_COURS) {
        en_cours++;
      } else if (etat === this.ETAT.LIVRAISON) {
        livraison++;
      } else if (etat === this.ETAT.REJETEE) {
        rejetee++;
        this.rejectedOrders.push({
          id: o.id!,                          // l’API fournit l’id
          date: o.date ?? '',                 // évite l’undefined
          articleNom: this.articleName(o.article_id),
          quantite: o.quantite,
          motifRejet: o.motifRejet ?? null,
        });
      } else {
        en_attente++;
      }
    }

    this.statsByState = {
      en_attente,
      validee: en_cours + livraison, // agrégation
      rejetee,
      recue,
    };
  }
}
