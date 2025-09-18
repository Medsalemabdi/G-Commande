import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Article, ArticleService } from './article.service';
import { Categorie, CategorieService } from '../categorie.service';
@Component({
  selector: 'app-gestion-articles',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './gestion-articles.html'
})
export class GestionArticles implements OnInit {
  articles: Article[] = [];
  categories: Categorie[] = [];
  newArticle: Article = { nom: '',description: '',categorie_id: 0 ,categorie: { id: 0, nom: '' } };
  editingArticle: Article | null = null;

  constructor(private articleService: ArticleService ,  private categorieService: CategorieService) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadArticles();
  }

  loadArticles() {
    this.articleService.getArticles().subscribe((data: Article[]) => this.articles = data);
  }

  loadCategories() {
    this.categorieService.getCategories().subscribe(data => this.categories = data);
  }

  getCategorieName(id: number  | undefined): string {
    if (id === undefined) return '';
    const cat = this.categories.find(c => c.id === id);
    return cat ? cat.nom : 'Inconnue';
  }

  addArticle() {
    this.articleService.addArticle(this.newArticle).subscribe(() => {
      this.newArticle = { nom: '',description: '' ,categorie_id: 0 ,categorie: { id: 0, nom: '' } };
      this.loadArticles();
    });
  }

  editArticle(article: Article) {
    this.editingArticle = { ...article };
  }

  updateArticle() {
    if (this.editingArticle) {
      this.articleService.updateArticle(this.editingArticle).subscribe(() => {
        this.editingArticle = null;
        this.loadArticles();
      });
    }
  }

  deleteArticle(id: number) {
    this.articleService.deleteArticle(id).subscribe(() => this.loadArticles());
  }
}
