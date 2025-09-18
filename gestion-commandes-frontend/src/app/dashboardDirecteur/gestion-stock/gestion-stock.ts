import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { jsPDF } from 'jspdf';
@Component({
  selector: 'app-gestion-stock',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './gestion-stock.html',
  
})
export class GestionStock implements OnInit {
  stocks: any[] = [];
  articles: any[] = [];   // 📌 liste des articles pour le select
  newStock: any = { quantite: 0, article_id: null };
  editingStock: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadStocks();
    this.loadArticles();
  }

  loadStocks() {
    this.http.get<any[]>('/api/stock').subscribe(data => this.stocks = data);
  }

  loadArticles() {
    this.http.get<any[]>('/api/article').subscribe(data => this.articles = data);
  }

  saveStock() {
    if (this.editingStock) {
      this.http.put(`/api/stock/${this.editingStock.id}`, this.editingStock)
        .subscribe(() => {
          this.loadStocks();
          this.editingStock = null;
        });
    } else {
      this.http.post('/api/stock', this.newStock)
        .subscribe(() => {
          this.loadStocks();
          this.newStock = { quantite: 0, articleId: null };
        });
    }
  }

  editStock(stock: any) {
    this.editingStock = { ...stock };
  }

  cancelEdit() {
    this.editingStock = null;
  }

  deleteStock(id: number) {
    this.http.delete(`/api/stock/${id}`).subscribe(() => this.loadStocks());
  }

  getArticleName(articleId: number): string {
  const article = this.articles.find(a => a.id === articleId);
  return article ? article.nom : 'Inconnu';
  }

  bcModalOpen = false;
bcTarget: { id?: number; quantite: number; article_id: number } | null = null;
bcQty = 1;

// Optionnels
bcSupplier = '';
bcUnitPrice?: number;
bcDeliveryDate = '';

openBC(stock: { id?: number; quantite: number; article_id: number }) {
  this.bcTarget = stock;
  this.bcQty = 1;
  this.bcSupplier = '';
  this.bcUnitPrice = undefined;
  this.bcDeliveryDate = '';
  this.bcModalOpen = true;
}

closeBC() {
  this.bcModalOpen = false;
  this.bcTarget = null;
}

// ====== Génération PDF (Bon de commande) ======
generateBC() {
  if (!this.bcTarget || !this.bcQty || this.bcQty < 1) return;

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const { width: W, height: H } = doc.internal.pageSize;
  const M = 40;
  let y = M;

  const brand = { r: 5, g: 150, b: 105 };   // emerald-600
  const muted = { r: 107, g: 114, b: 128 }; // gray-500

  const articleName = this.getArticleName(this.bcTarget.article_id);
  const qtyCurrent = this.bcTarget.quantite ?? 0;
  const qtyOrder = Number(this.bcQty) || 0;
  const unitPrice = Number(this.bcUnitPrice ?? 0);
  const total = unitPrice > 0 ? unitPrice * qtyOrder : null;

  // Barre fine
  doc.setFillColor(brand.r, brand.g, brand.b);
  doc.rect(0, 0, W, 8, 'F');

  // "Logo" mot-symbole
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(brand.r, brand.g, brand.b);
  doc.text('G-Commande', M, y + 22);
  const wm = doc.getTextWidth('G-Commande');
  doc.setDrawColor(brand.r, brand.g, brand.b);
  doc.line(M, y + 26, M + wm, y + 26);

  // Titre
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(20);
  doc.text('Bon de commande — Réapprovisionnement', M, y + 56);

  // Sous-titres
  doc.setFont('helvetica', 'normal'); doc.setFontSize(11);
  doc.setTextColor(muted.r, muted.g, muted.b);
  const today = new Date().toLocaleDateString();
  doc.text(`Date d’émission : ${today}`, M, y + 74);
  if (this.bcSupplier?.trim()) doc.text(`Fournisseur : ${this.bcSupplier.trim()}`, M, y + 90);
  if (this.bcDeliveryDate)     doc.text(`Livraison prévue : ${new Date(this.bcDeliveryDate).toLocaleDateString()}`, M, y + 106);

  y += 120;

  // Tableau récap
  const tableX = M, tableW = W - 2*M;
  const th = 24, rowH = 22;

  // En-tête tableau
  doc.setFillColor(243, 244, 246); // gray-100
  doc.rect(tableX, y, tableW, th, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(17, 24, 39);
  const cols = [
    { label: 'Article', x: tableX + 10, align: 'left' as const },
    { label: 'Qté à commander', x: tableX + tableW * 0.4, align: 'left' as const },
    { label: 'PU', x: tableX + tableW * 0.65, align: 'left' as const },
    { label: 'Montant', x: tableX + tableW - 10, align: 'right' as const },
  ];
  cols.forEach(c => doc.text(c.label, c.x, y + 16, { align: c.align }));

  // Ligne data
  y += th;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(31, 41, 55);
  doc.rect(tableX, y, tableW, rowH, 'S'); // bordure

  doc.text(articleName, cols[0].x, y + 15, { align: cols[0].align });
  doc.text(String(qtyOrder), cols[1].x, y + 15, { align: cols[1].align });
  doc.text(unitPrice ? unitPrice.toFixed(1) : '—', cols[2].x, y + 15, { align: cols[2].align });
  doc.text(total ? total.toFixed(1) : '—', cols[3].x, y + 15, { align: cols[3].align });

  y += rowH + 12;

  // Observations
  doc.setDrawColor(230, 232, 235);
  doc.roundedRect(M, y, W - 2*M, 70, 8, 8, 'S');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(17, 24, 39);
  doc.text('Observations', M + 10, y + 18);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(55, 65, 81);
  doc.text(
    'Commande externe pour réapprovisionnement. Merci de confirmer la disponibilité et le délai.',
    M + 10, y + 36
  );

  y += 90;

  // Signatures
  const sigW = (W - 2*M - 24) / 3;
  this.drawSignatureBox(doc, M, y, sigW, 'Directeur / DA (sign.)');
  this.drawSignatureBox(doc, M + sigW + 12, y, sigW, 'Service appro / Fournisseur');
  this.drawSignatureBox(doc, M + 2*(sigW + 12), y, sigW, 'Cachet fournisseur');

  // Pied de page
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(120,120,120);
  doc.text('Document généré automatiquement — G-Commande', W/2, H - 24, { align: 'center' });

  const safeName = articleName.replace(/[^\w\-]+/g, '_');
  doc.save(`BC_${safeName}_${today}.pdf`);

  this.closeBC();
}

/* === Helper signature box (réutilisable) === */
private drawSignatureBox(doc: jsPDF, x: number, y: number, w: number, label: string) {
  const h = 110;
  doc.setDrawColor(230, 232, 235);
  doc.roundedRect(x, y, w, h, 8, 8, 'S');

  // ligne signature
  doc.setDrawColor(200, 200, 200);
  doc.line(x + 16, y + 70, x + w - 16, y + 70);

  // label
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(100, 116, 139);
  doc.text(label, x + 16, y + 24);

  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(120,120,120);
  doc.text('Nom et signature', x + 16, y + 86);
}

}
