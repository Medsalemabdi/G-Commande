// src/app/dashboardDA/commande.service.da.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommandeDto } from '../models/commande.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CommandeService {
  private baseUrl = '/api/commandes'; // adapte si besoin

  constructor(private http: HttpClient) {}

  /** Toutes les commandes (DA) */
  getAll(): Observable<CommandeDto[]> {
    return this.http.get<CommandeDto[]>(`${this.baseUrl}`);
  }

  /** Valider par DA (à toi d’exposer le bon endpoint) */
  validerParDA(id: number): Observable<CommandeDto> {
    return this.http.put<CommandeDto>(`${this.baseUrl}/${id}/valider-da`, {});
  }

  /** Rejeter par DA avec motif */
  rejeterParDA(id: number, motif: string): Observable<CommandeDto> {
    return this.http.put<CommandeDto>(`${this.baseUrl}/${id}/rejeter-da`, { motif });
  }

  /** Générer / imprimer bon d’achat (PDF) */
  imprimerBonAchat(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/bon-achat`, { responseType: 'blob' });
  }
}
