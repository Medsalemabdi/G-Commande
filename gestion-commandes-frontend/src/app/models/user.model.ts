import { Role } from "./role.model";

export interface User {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  role: Role // Référence à un rôle
  responsable?: User; // Référence à un autre utilisateur (manager)
  createdAt: Date;
}