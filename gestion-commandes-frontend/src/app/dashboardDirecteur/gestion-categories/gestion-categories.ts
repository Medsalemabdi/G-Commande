import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Categorie, CategorieService } from '../categorie.service';

@Component({
  selector: 'app-gestion-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './gestion-categories.html'
})
export class GestionCategories implements OnInit {
  categories: Categorie[] = [];
  newCategorie: Categorie = { id:0 , nom: '' };
  editingCategorie: Categorie | null = null;

  constructor(private categorieService: CategorieService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories() {
    this.categorieService.getCategories().subscribe(data => this.categories = data);
  }

  addCategorie() {
    if (!this.newCategorie.nom.trim()) return;
    this.categorieService.addCategorie(this.newCategorie).subscribe(() => {
      this.newCategorie = { id:0 , nom: '' };
      this.loadCategories();
    });
  }

  editCategorie(categorie: Categorie) {
    this.editingCategorie = { ...categorie };
  }

  updateCategorie() {
    if (this.editingCategorie) {
      this.categorieService.updateCategorie(this.editingCategorie).subscribe(() => {
        this.editingCategorie = null;
        this.loadCategories();
      });
    }
  }

  deleteCategorie(id: number) {
    this.categorieService.deleteCategorie(id).subscribe(() => this.loadCategories());
  }
}
