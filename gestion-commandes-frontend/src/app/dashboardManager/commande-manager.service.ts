// src/app/dashboardManager/commande-manager.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommandeDto } from '../models/commande.model';

@Injectable({ providedIn: 'root' })
export class CommandeManagerService {
  private baseUrl = '/api/commandes';

  constructor(private http: HttpClient) {}

  getManaged(): Observable<CommandeDto[]> {
    return this.http.get<CommandeDto[]>(`${this.baseUrl}/managed`);
  }

  validate(id: number): Observable<CommandeDto> {
    return this.http.put<CommandeDto>(`${this.baseUrl}/${id}/manager/valider`, {});
  }

  reject(id: number, motif: string): Observable<CommandeDto> {
    return this.http.put<CommandeDto>(`${this.baseUrl}/${id}/manager/rejeter`, { motif });
  }

  update(id: number, payload: { article_id: number; quantite: number }): Observable<CommandeDto> {
    return this.http.put<CommandeDto>(`${this.baseUrl}/${id}/manager`, payload);
  }
}
