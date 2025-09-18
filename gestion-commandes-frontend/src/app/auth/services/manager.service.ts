// src/app/services/manager.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Manager {
  id: number;
  username: string;
}

@Injectable({ providedIn: 'root' })
export class ManagerService {
  private apiUrl = '/api/users/managers';
  constructor(private http: HttpClient) {}
  getManagers(): Observable<Manager[]> {
    return this.http.get<Manager[]>(this.apiUrl);
  }
}
