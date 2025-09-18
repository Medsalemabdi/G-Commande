package mr.bmci.gestioncommandesbackend.web;

import mr.bmci.gestioncommandesbackend.application.ArticleService;
import mr.bmci.gestioncommandesbackend.application.CategorieService;
import mr.bmci.gestioncommandesbackend.domaine.Article;
import mr.bmci.gestioncommandesbackend.domaine.Categorie;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategorieController {
    CategorieService categorieService;
    ArticleService articleService;

    CategorieController(CategorieService categorieService , ArticleService articleService) {
        this.categorieService = categorieService;
        this.articleService = articleService;
    }
    @GetMapping
    public ResponseEntity<List<Categorie>> getCategories() {
        return ResponseEntity.ok(categorieService.listCategories());
    }

    // ✅ Obtenir une catégorie par ID
    @GetMapping("/{id}")
    public ResponseEntity<Categorie> getCategorieById(@PathVariable Long id,@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {return ResponseEntity.status(401).build();}
        return categorieService.findCategorieById(id) != null
                ? ResponseEntity.ok(categorieService.findCategorieById(id))
                : ResponseEntity.notFound().build();
    }

    // ✅ Créer une nouvelle catégorie
    @PostMapping
    public ResponseEntity<Categorie> addCategorie(@RequestBody Categorie categorie, @AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {return ResponseEntity.status(401).build();}
        Categorie saved = categorieService.createCategorie(categorie);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // ✅ Mettre à jour une catégorie
    @PutMapping("/{id}")
    public ResponseEntity<Categorie> updateCategorie(@PathVariable Long id, @RequestBody Categorie categorie, @AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {return ResponseEntity.status(401).build();}
        Categorie existing = categorieService.findCategorieById(id);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        existing.setNom(categorie.getNom());
        Categorie updated = categorieService.updateCategorie(existing);
        return ResponseEntity.ok(updated);
    }

    // ✅ Supprimer une catégorie
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategorie(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {return ResponseEntity.status(401).build();}
        Categorie existing = categorieService.findCategorieById(id);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        categorieService.deleteCategorie(id);
        return ResponseEntity.noContent().build();
    }



}
