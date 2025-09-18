export interface CommandeDto {
  id?: number;
  etatCommandeId?: number;   // défini côté back
  date?: string | Date;      // défini côté back
  motifRejet?: string;       // défini/retourné côté back si besoin
  article_id: number;
  quantite: number;
  enstock?: boolean;         // défini côté back
  utilisateur_matricule?: number;   // déterminé par le back via le token
}

/** Payload minimal pour créer/mettre à jour */
export interface CreateCommandePayload {
  article_id: number;
  quantite: number;
}