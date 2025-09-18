// src/app/dashboardUser/commande.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommandeDto, CreateCommandePayload } from '../models/commande.model';

@Injectable({ providedIn: 'root' })
export class CommandeService {
  private baseUrl = '/api/commandes'; // ou http://localhost:8080/api/commandes si pas de proxy

  constructor(private http: HttpClient) {}

  getAll(): Observable<CommandeDto[]> {
    return this.http.get<CommandeDto[]>(this.baseUrl);
  }

  getById(id: number): Observable<CommandeDto> {
    return this.http.get<CommandeDto>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateCommandePayload): Observable<CommandeDto> {
    return this.http.post<CommandeDto>(this.baseUrl, payload);
  }

  update(id: number, payload: CreateCommandePayload): Observable<CommandeDto> {
    return this.http.put<CommandeDto>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  markRecue(id: number) {
  return this.http.patch<CommandeDto>(`${this.baseUrl}/${id}/recue`, {});
  }

   getMyCommandes(): Observable<CommandeDto[]> {
    // Si ton backend ne fournit pas /mine et renvoie déjà "mes" commandes via GET /api/commandes :
    // return this.http.get<CommandeDto[]>(this.apiUrl);
    return this.http.get<CommandeDto[]>(`${this.baseUrl}/mine`);
  }
}
