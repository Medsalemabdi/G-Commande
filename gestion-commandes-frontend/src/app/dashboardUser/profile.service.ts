// src/app/dashboardUser/profile.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UtilisateurProfileDto {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  role?: string;
  responsableId?: number;
}

export interface UpdateProfileRequest {
  nom: string;
  prenom: string;
  email: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private baseUrl = 'http://localhost:8080/api/me';

  constructor(private http: HttpClient) {}

  getMe(): Observable<UtilisateurProfileDto> {
    return this.http.get<UtilisateurProfileDto>(this.baseUrl);
  }

  updateMe(payload: UpdateProfileRequest): Observable<UtilisateurProfileDto> {
    return this.http.put<UtilisateurProfileDto>(this.baseUrl, payload);
  }

  changePassword(payload: ChangePasswordRequest): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/password`, payload);
  }
}
