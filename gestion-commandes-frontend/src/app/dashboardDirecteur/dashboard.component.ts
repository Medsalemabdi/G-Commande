// src/app/dashboardDA/dashboard-da.component.ts
import { Component, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Pipe, PipeTransform } from '@angular/core';

import { ArticleService, Article } from '../dashboardDirecteur/gestion-articles/article.service';
import { ProfileService, UtilisateurProfileDto } from '../dashboardUser/profile.service';
import { CommandeService } from './commande.service.da'; // <-- adapte le chemin / nom
import { CommandeDto } from '../models/commande.model';
import { GestionArticles } from './gestion-articles/gestion-articles';
import { GestionCategories } from './gestion-categories/gestion-categories';
import { GestionStock } from './gestion-stock/gestion-stock';
import { jsPDF } from 'jspdf';


/* ========= Pipe : filtre par état (utilisé dans le HTML : | daCommandeEtat:filterEtat ) ========= */
@Pipe({ name: 'daCommandeEtat', standalone: true })
export class DaCommandeEtatPipe implements PipeTransform {
  transform(list: CommandeDto[] | null | undefined, etat: number | null): CommandeDto[] {
    if (!list || etat === null || etat === undefined) return list ?? [];
    return (list ?? []).filter(c => (c.etatCommandeId ?? 0) === etat);
  }
}

/* ========= Composant Dashboard DA ========= */
@Component({
  selector: 'app-dashboard-da',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DatePipe, DaCommandeEtatPipe,GestionArticles,GestionCategories,GestionStock],
  templateUrl: './dashboard.component.html',
})
export class DashboardDaComponent implements OnInit {
  /* --- UI / Navigation --- */
  activeSection: 'articles' | 'categories' | 'stocks' | 'commandes' | 'profile' = 'commandes';
  mobileMenuOpen = false;
  isMobile = window.innerWidth < 768;

  /* --- Données --- */
  commandes: CommandeDto[] = [];
  articles: Article[] = [];

  loading = false;
  error: string | null = null;

  /* --- Filtres --- */
  filterEtat: number | null = null;

  /* --- Profil --- */
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  me: UtilisateurProfileDto | null = null;
  profileSaving = false;
  passwordSaving = false;
  profileMsg: string | null = null;
  passwordMsg: string | null = null;

  /* --- Modal rejet --- */
  rejectedModalOpen = false;
  rejectTarget: CommandeDto | null = null;
  rejectReason = '';

  /* --- États (visibles au template) --- */
  readonly ETAT = {
    EN_ATTENTE: 0,
    RECUE: 1,
    EN_COURS: 2,
    LIVRAISON: 3,
    REJETEE: 4,
  } as const;

  /* --- DI --- */
  private fb = inject(FormBuilder);
  private commandesApi = inject(CommandeService);
  private articleApi = inject(ArticleService);
  private profileApi = inject(ProfileService);

  /* --- Lifecycle --- */
  ngOnInit(): void {
    this.buildForms();
    this.loadEverything();
  }

  @HostListener('window:resize')
  onResize() { this.isMobile = window.innerWidth < 768; }

  /* --- Navigation --- */
  setSection(s: typeof this.activeSection) { this.activeSection = s; this.mobileMenuOpen = false; }
  toggleMobileMenu() { this.mobileMenuOpen = !this.mobileMenuOpen; }

  /* --- Forms --- */
  private buildForms() {
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
  }

  /* --- Loaders --- */
  refreshAll() { this.loadEverything(); }

  private loadEverything() {
    this.loadArticles();
    this.loadCommandes();
    this.loadProfile();
  }

  private loadArticles() {
    this.articleApi.getArticles().subscribe({
      next: (list) => { this.articles = list ?? []; },
      error: (err) => { console.warn('Articles error', err); }
    });
  }

  private loadCommandes() {
    this.loading = true; this.error = null;
    
    this.commandesApi.getAll().subscribe({
      next: (list) => { this.commandes = list ?? []; this.loading = false; },
      error: (err) => { this.error = this.humanizeError(err); this.loading = false; }
    });
  }

  private loadProfile() {
    this.profileApi.getMe().subscribe({
      next: (me) => {
        this.me = me;
        this.profileForm.patchValue({
          nom: me.nom ?? '',
          prenom: me.prenom ?? '',
          email: me.email ?? '',
        });
      },
      error: () => { /* profil non bloquant */ }
    });
  }

  /* --- Helpers display --- */
  statusLabel(id?: number) {
    if (!id || id === this.ETAT.EN_ATTENTE) return 'En attente';
    switch (id) {
      case this.ETAT.RECUE:     return 'Recue';
      case this.ETAT.EN_COURS:  return 'En cours';
      case this.ETAT.LIVRAISON: return 'En cours de livraison';
      case this.ETAT.REJETEE:   return 'Rejetée';
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
    // NB: si tu veux aussi afficher la catégorie: `${a?.nom} (${a?.categorie?.nom ?? '-'})`
  }

  humanizeError(err: any): string {
    if (err?.error?.message) return err.error.message;
    if (typeof err === 'string') return err;
    if (err?.status === 409) return 'Stock insuffisant pour valider cette commande.';
    return 'Une erreur est survenue. Veuillez réessayer.';
  }

  /* --- Règles d’actions DA --- */

  /** Valider visible si:
   * - pas Rejetée, pas Reçue, pas en Livraison
   * - en stock (c.enstock === true)
   * - etat en cours / attente / livraison -> à toi de préciser; je mets "pas rejetée ni reçue"
   */
  canValidate(c: CommandeDto): boolean {
    const e = c.etatCommandeId ?? this.ETAT.EN_ATTENTE;
    return c.enstock === true && e !== this.ETAT.REJETEE && e !== this.ETAT.RECUE && e !== this.ETAT.LIVRAISON;
  }

  /** Rejeter visible si (selon ta règle): uniquement si EN_COURS */
  canReject(c: CommandeDto): boolean {
    const e = c.etatCommandeId ?? this.ETAT.EN_ATTENTE;
    return e === this.ETAT.EN_COURS;
  }

  /** Imprimer bon d’achat si PAS en stock (peu importe l’état ici) */
  canPrintPO(c: CommandeDto): boolean {
    return c.enstock !== true;
  }

  /* --- Actions --- */

  validate(c: CommandeDto) {
    if (!c.id) return;
    this.loading = true; this.error = null;
    // Backend: endpoint DA -> valider commande (met par ex. etat = EN_COURS ou RECUE selon ton process)
    this.commandesApi.validerParDA(c.id).subscribe({
      next: (updated) => {
        this.commandes = this.commandes.map(x => x.id === updated.id ? updated : x);
        this.loading = false;
      },
      error: (err) => { 
        
        this.error = this.humanizeError(err); this.loading = false; }
    });
  }

  openReject(c: CommandeDto) {
    this.rejectTarget = c;
    this.rejectReason = '';
    this.rejectedModalOpen = true;
  }

  closeReject() {
    this.rejectedModalOpen = false;
    this.rejectTarget = null;
    this.rejectReason = '';
  }

  applyReject() {
    if (!this.rejectTarget?.id) return;
    const reason = (this.rejectReason ?? '').trim();
    if (reason.length < 3) return;

    this.loading = true; this.error = null;
    // Backend: endpoint DA -> rejeter commande (etat = REJETEE + motif)
    this.commandesApi.rejeterParDA(this.rejectTarget.id, reason).subscribe({
      next: (updated) => {
        this.commandes = this.commandes.map(x => x.id === updated.id ? updated : x);
        this.loading = false;
        this.closeReject();
      },
      error: (err) => { this.error = this.humanizeError(err); this.loading = false; }
    });
  }

  /** Imprime / télécharge un bon d’achat (PDF) pour réappro */
  printPO(c: CommandeDto) {
    if (!c.id) return;
    // Backend: retourne un Blob (PDF) pour la commande
    this.commandesApi.imprimerBonAchat(c.id).subscribe({
      next: (blob) => {
        const file = new Blob([blob], { type: 'application/pdf' });
        const url = URL.createObjectURL(file);
        // Ouvre un nouvel onglet
        window.open(url, '_blank');
        // Optionnel: lancer l’impression automatiquement:
        // const w = window.open(url, '_blank'); w?.addEventListener('load', () => w.print());
        // Optionnel: révoquer l’URL plus tard
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      },
      error: (err) => { this.error = this.humanizeError(err); }
    });
  }

  /* --- Profil --- */
  submitProfile() {
    if (this.profileForm.invalid) return;
    this.profileSaving = true;
    this.profileMsg = null;

    const v = this.profileForm.value;
    const payload = {
      nom: String(v.nom ?? ''),
      prenom: String(v.prenom ?? ''),
      email: String(v.email ?? ''),
    };

    this.profileApi.updateMe(payload).subscribe({
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
    if ((newPassword ?? '') !== (confirmNewPassword ?? '')) {
      this.passwordMsg = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.passwordSaving = true;
    this.passwordMsg = null;

    this.profileApi.changePassword({
      oldPassword: String(oldPassword ?? ''),
      newPassword: String(newPassword ?? ''),
    }).subscribe({
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

  /** PV visible uniquement si état = LIVRAISON (3) */
canPrintPV(c: CommandeDto): boolean {
  const e = c.etatCommandeId ?? this.ETAT.EN_ATTENTE;
  return e === this.ETAT.LIVRAISON;
}

/** Ouvre une fenêtre imprimable (HTML → Impression / PDF) */
downloadPV(c: CommandeDto) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const { width: W, height: H } = doc.internal.pageSize;
  const M = 40;
  let y = M;

  // Palette
  const brand      = { r: 5, g: 150, b: 105 }; // #059669 emerald-600
  const brandDark  = { r: 4, g: 120, b: 87 };  // #047857 emerald-700

  // Barre fine en haut
  doc.setFillColor(brand.r, brand.g, brand.b);
  doc.rect(0, 0, W, 8, 'F');

  // ====== "Logo" mot-symbole (comme le <h1 class="text-green-600">G-Commande</h1>)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(brand.r, brand.g, brand.b);
  doc.text('G-Commande', M, y + 22);

  // Petit soulignement d’accent sous le mot-symbole
  const wordmarkWidth = doc.getTextWidth('G-Commande');
  doc.setDrawColor(brand.r, brand.g, brand.b);
  doc.setLineWidth(1);
  doc.line(M, y + 26, M + wordmarkWidth, y + 26);

  // Titre + méta
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(20);
  doc.text('Procès-verbal de livraison', M, y + 56);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text(`Référence commande : #${c.id ?? ''}`, M, y + 74);
  doc.text(`Date d’édition : ${new Date().toLocaleDateString()}`, M, y + 90);

  // Pastille d’état
  this.drawChip(doc, W - M - 210, y + 50, 'EN COURS DE LIVRAISON', brandDark);

  y += 100;

  // Filigrane discret
  this.drawWatermark(doc, 'G-Commande', W, H);

  // Deux colonnes: Infos commande / Détails livraison
  const colW = (W - 2 * M - 16) / 2;
  this.drawSectionBox(doc, M, y, colW, 120, 'Informations commande', [
    ['N° commande', `#${c.id ?? ''}`],
    ['Date de demande', c.date ? new Date(c.date).toLocaleDateString() : '—'],
    ['Demandeur', this.me ? `${this.me.prenom ?? ''} ${this.me.nom ?? ''}`.trim() : '—'],
  ]);

  this.drawSectionBox(doc, M + colW + 16, y, colW, 120, 'Détails de la livraison', [
    ['Article', this.articleName(c.article_id)],
    ['Quantité', String(c.quantite ?? '—')],
    ['Observations', c.motifRejet ? `Rejet antérieur : ${c.motifRejet}` : '—'],
  ]);

  y += 134;

  // Attestation
  const attestation =
    'Nous, soussignés, attestons de la livraison des biens mentionnés ci-dessus, ' +
    'en bon état apparent, conformément à la commande référencée. Toute réserve éventuelle ' +
    'a été consignée le cas échéant.';
  this.drawParagraphBox(doc, M, y, W - 2 * M, 90, 'Attestation', attestation);

  y += 104;

  // Signatures (3 colonnes) + cachet Directeur admin
  const sigW = (W - 2 * M - 24) / 3;
  this.drawSignatureBox(doc, M, y, sigW, 'Magasinier');
  this.drawSignatureBox(doc, M + sigW + 12, y, sigW, 'Réceptionnaire');
  this.drawSignatureBox(doc, M + 2 * (sigW + 12), y, sigW, 'Directeur administratif');
  // Tampon rouge
  

  // Pied de page
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(120, 120, 120);
  doc.text('Document généré automatiquement — G-Commande', W / 2, H - 24, { align: 'center' });

  doc.save(`PV_livraison_${c.id ?? ''}.pdf`);
}

/* ===== Helpers jsPDF (copie/colle tels quels) ===== */

private drawChip(doc: jsPDF, x: number, y: number, text: string, color: { r: number; g: number; b: number }) {
  doc.setFillColor(color.r, color.g, color.b);
  doc.setDrawColor(color.r, color.g, color.b);
  const padX = 10, padY = 6;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(255, 255, 255);
  const tw = doc.getTextWidth(text);
  doc.roundedRect(x, y - 12, tw + padX * 2, 24, 8, 8, 'F');
  doc.text(text, x + padX, y + 3);
  doc.setTextColor(0, 0, 0);
}

private drawSectionBox(
  doc: jsPDF, x: number, y: number, w: number, h: number,
  title: string, pairs: Array<[string, string]>
) {
  doc.setDrawColor(230, 232, 235);
  doc.roundedRect(x, y, w, h, 8, 8, 'S');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(17, 24, 39);
  doc.text(title, x + 10, y + 18);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  let yy = y + 34; const lh = 18;
  pairs.forEach(([k, v], i) => {
    if (i % 2 === 1) { doc.setFillColor(249, 250, 251); doc.rect(x + 6, yy - 12, w - 12, lh, 'F'); }
    doc.setTextColor(100, 116, 139); doc.text(k, x + 12, yy);
    doc.setTextColor(31, 41, 55);   doc.text(v || '—', x + w / 2, yy);
    yy += lh;
  });
}

private drawParagraphBox(doc: jsPDF, x: number, y: number, w: number, h: number, title: string, text: string) {
  doc.setDrawColor(230, 232, 235);
  doc.roundedRect(x, y, w, h, 8, 8, 'S');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(17, 24, 39);
  doc.text(title, x + 10, y + 18);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(55, 65, 81);
  const wrapped = doc.splitTextToSize(text, w - 20);
  doc.text(wrapped, x + 10, y + 36);
}

private drawSignatureBox(doc: jsPDF, x: number, y: number, w: number, label: string) {
  const h = 110;
  doc.setDrawColor(230, 232, 235);
  doc.roundedRect(x, y, w, h, 8, 8, 'S');
  doc.setDrawColor(200, 200, 200);
  doc.line(x + 16, y + 70, x + w - 16, y + 70);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(100, 116, 139);
  doc.text(label, x + 16, y + 24);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(120, 120, 120);
  doc.text('Nom et signature', x + 16, y + 86);
}



private drawWatermark(doc: jsPDF, text: string, W: number, H: number) {
  const anyDoc = doc as any;
  if (anyDoc.setGState) {
    doc.saveGraphicsState();
    doc.setGState(new anyDoc.GState({ opacity: 0.06 }));
    doc.setFont('helvetica', 'bold'); doc.setFontSize(90); doc.setTextColor(5, 150, 105);
    doc.text(text, W / 2, H / 2, { align: 'center', angle: -25 });
    doc.restoreGraphicsState();
  } else {
    // Fallback sans GState (anciennes versions)
    doc.setFont('helvetica', 'bold'); doc.setFontSize(90); doc.setTextColor(210, 235, 225);
    doc.text(text, W / 2, H / 2, { align: 'center', angle: -25 });
  }
}
  
}
