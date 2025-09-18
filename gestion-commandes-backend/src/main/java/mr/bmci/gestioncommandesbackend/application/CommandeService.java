package mr.bmci.gestioncommandesbackend.application;


import mr.bmci.gestioncommandesbackend.domaine.Commande;
import mr.bmci.gestioncommandesbackend.domaine.EtatCommande;
import mr.bmci.gestioncommandesbackend.ports.EtatCommandeRepository;
import mr.bmci.gestioncommandesbackend.ports.IDepotCommande;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service

public class CommandeService {

    private final IDepotCommande depotCommande;
    private final UtilisateurService utilisateurService;
    private final ArticleService articleService;
    private final StockService stockService;
    private final EtatCommandeRepository etatCommandeRepository;



    public CommandeService(IDepotCommande depotCommande ,
                           UtilisateurService utilisateurService ,
                           ArticleService articleService ,
                           StockService stockService ,
                           EtatCommandeRepository etatCommandeRepository) {
        this.depotCommande = depotCommande;
        this.utilisateurService = utilisateurService;
        this.articleService = articleService;
        this.stockService = stockService;
        this.etatCommandeRepository = etatCommandeRepository;
    }
    // --- GET all commandes ---
    public List<Commande> getAllCommandes() {
        return depotCommande.findAll();
    }

    // --- GET by ID ---
    public Optional<Commande> getCommandeById(Long id) {
        return depotCommande.findById(id);
    }



    // --- UPDATE ---
    public Commande updateCommandeForUser(Commande existing, Long articleId, int quantite) {
        if (articleId != null && !articleId.equals(existing.getArticle().getId())) {
            var article = articleService.findArticleById(articleId);
            if (article == null) {
                throw new IllegalArgumentException("Article introuvable: " + articleId);
            }
            existing.setArticle(article);
        }
        existing.setQuantite(quantite);

        // recalcul stock/état si nécessaire
        boolean enstock = stockService != null
                ? stockService.isDisponible(existing.getArticle(), quantite)
                : existing.isEnstock();
        existing.setEnstock(enstock);

        return depotCommande.save(existing);
    }


    // --- DELETE ---
    public void deleteCommande(Long id) {
        depotCommande.delete(id);

    }

    // --- CREATE ---
    public Commande createCommandeForUser(String userMatricule, Long articleId, int quantite) {
        var user = utilisateurService.findByMatricule(userMatricule);
        if (user == null) {
            throw new IllegalArgumentException("Utilisateur introuvable: " + userMatricule);
        }

        var article = articleService.findArticleById(articleId);
        if (article == null) {
            throw new IllegalArgumentException("Article introuvable: " + articleId);
        }

        var cmd = new Commande();
        cmd.setUtilisateur(user.get());
        cmd.setArticle(article);
        cmd.setQuantite(quantite);
        cmd.setDate(LocalDate.now().now());
        // logique stock
        boolean enstock = stockService != null
                ? stockService.isDisponible(article, quantite)
                : true; // à remplacer par ta vraie logique
        cmd.setEnstock(enstock);

        // état initial
        EtatCommande etatInitial = etatCommandeRepository.findByNom("En attente")
                .orElse(null); // ou crée-le au démarrage
        cmd.setEtatCommande(etatInitial);

        return depotCommande.save(cmd);
    }

    @Transactional
    public Commande markRecueForUser(Long commandeId, String userMatricule) {
        Commande cmd = depotCommande.findById(commandeId)
                .orElseThrow(() -> new IllegalArgumentException("Commande introuvable: " + commandeId));

        if (cmd.getUtilisateur() == null || !cmd.getUtilisateur().getMatricule().equals(userMatricule)) {
            throw new SecurityException("Accès interdit: commande appartenant à un autre utilisateur.");
        }

        // Transition d'état : autoriser seulement si pas déjà reçue (à adapter si tu veux d'autres règles)
        EtatCommande etatRecue = etatCommandeRepository.findByNom("Recue")
                .orElseThrow(() -> new IllegalStateException("Etat 'Recue' introuvable."));

        cmd.setEtatCommande(etatRecue);
        // Si tu veux aussi figer enstock, date de réception, etc., fais-le ici
        return depotCommande.save(cmd);
    }


    public List<Commande> getByUtilisateurMatricule(String matricule) {
        return depotCommande.findByUtilisateurMatricule(matricule);
    }

    public List<Commande> getManagedBy(String matricule) {
        return depotCommande.findByUtilisateur_Responsable_Matricule(matricule);
    }

    private void assertManaged(String managerMatricule, Commande c) {
        String respId = (c.getUtilisateur() != null && c.getUtilisateur().getResponsable() != null)
                ? c.getUtilisateur().getResponsable().getMatricule() : null;
        if (respId == null || !respId.equals(managerMatricule)) {
            throw new AccessDeniedException("Commande non gérée par ce manager");
        }
    }

    public Commande managerValidate(String managerId, Long commandeId) {
        Commande c = depotCommande.findById(commandeId).orElseThrow();
        assertManaged(managerId, c);
        c.setEtatCommande(etatCommandeRepository.findByNom("En cours").get()); // 2 = "En cours" (à adapter à ta table)
        c.setMotifRejet(null);
        boolean enstock = stockService != null
                ? stockService.isDisponible(c.getArticle(), c.getQuantite())
                : c.isEnstock();
        c.setEnstock(enstock);
        return depotCommande.save(c);
    }

    public Commande managerReject(String managerId, Long commandeId, String motif) {
        Commande c = depotCommande.findById(commandeId).orElseThrow();
        assertManaged(managerId, c);
        c.setEtatCommande(etatCommandeRepository.findByNom("Rejete").get()); // 4 = "Rejetée"
        c.setMotifRejet(motif);
        return depotCommande.save(c);
    }

    public Commande managerUpdate(String managerId, Long commandeId, Long articleId, int quantite) {
        Commande c = depotCommande.findById(commandeId).orElseThrow();
        assertManaged(managerId, c);
        c.setArticle(articleService.findArticleById(articleId)); // ManyToOne côté Commande
        c.setQuantite(quantite);
        boolean enstock = stockService != null
                ? stockService.isDisponible(c.getArticle(), quantite)
                : c.isEnstock();
        c.setEnstock(enstock);
        // tu peux remettre à "En attente" si souhaité
        return depotCommande.save(c);
    }

    public Commande daValidateAndDecreaseStock(Long commandeId) {
        Commande cmd = depotCommande.findById(commandeId)
                .orElseThrow(() -> new IllegalArgumentException("Commande introuvable"));

        String etat = cmd.getEtatCommande() != null ? cmd.getEtatCommande().getNom() : "En attente";
        if (etat.equals("Recu") || etat.equals("Rejete")) {
            throw new IllegalStateException("Commande déjà clôturée (reçue/rejetée).");
        }

        if (cmd.getArticle() == null) throw new IllegalStateException("Commande sans article.");
        int qte = cmd.getQuantite();

        // Récupérer le stock
        var stock = stockService.findStockByArticle(cmd.getArticle());

        try {
            stock.reserver(qte);
        }catch (Exception e) {
            throw new IllegalStateException("Stock insuffisant");
        }
        stockService.updateStock(stock);

        // Marquer la commande comme validée côté DA (ex: EN_COURS) & enstock = true
        EtatCommande etatEnCoursLivraison = etatCommandeRepository.findByNom("En cours livraison")
                .orElseThrow(() -> new IllegalStateException("État En cours livraison manquant en base"));
        cmd.setEtatCommande(etatEnCoursLivraison);
        cmd.setEnstock(true);
        cmd.setMotifRejet(null);

        return depotCommande.save(cmd);
    }

    @Transactional
    public Commande daReject(Long commandeId, String motif) {
        Commande cmd = depotCommande.findById(commandeId)
                .orElseThrow(() -> new IllegalArgumentException("Commande introuvable"));

        String etat = cmd.getEtatCommande() != null ? cmd.getEtatCommande().getNom() : "En cours";
        if (etat.equals("Recu")) {
            throw new IllegalStateException("Commande déjà reçue, rejet impossible.");
        }

        EtatCommande etatRejetee = etatCommandeRepository.findByNom("Rejete")
                .orElseThrow(() -> new IllegalStateException("État REJETEE manquant en base"));

        cmd.setEtatCommande(etatRejetee);
        cmd.setMotifRejet(motif != null ? motif.trim() : "Rejetée par DA");
        return depotCommande.save(cmd);
    }

    public List<Commande> getAllForDAExcludingPending() {

        Long pendingId = etatCommandeRepository.findByNom("En attente")
                .orElseThrow().getId();
         return depotCommande.findByEtatCommande_IdNot(pendingId);
    }
}
