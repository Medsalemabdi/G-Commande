import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SignupDto {
  username: string;
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role: string;
  managerId?: number;     // ← champ optionnel pour le manager
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: string; 
}

type JwtPayload = { sub: string; role?: string; };

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Avec proxy (proxy.conf.json redirige /api vers localhost:8080)
  private baseUrl = '/api/auth';

  constructor(private http: HttpClient) {}

  signup(dto: SignupDto): Observable<HttpResponse<any>> {
    const payload: any = {
      username: dto.username,
      nom: dto.nom,
      prenom: dto.prenom,
      email: dto.email,
      role: dto.role,
      password: dto.password
    };
    // N'ajouter managerId que si défini
    if (dto.managerId !== undefined) {
      payload.managerId = dto.managerId;
    }

    return this.http.post<any>(
      `${this.baseUrl}/signup`,
      payload,
      { observe: 'response' }
    );
  }
  
  login(dto: LoginDto): Observable<HttpResponse<any>> {
    return this.http.post<any>(
      `${this.baseUrl}/login`,    
      { username: dto.username, password: dto.password },
      { observe: 'response' }
    );
  }

  private readonly TOKEN_KEY = 'jwtToken';
  private readonly ROLE_KEY = 'userRole';

  get token(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.token;
  }

  /** Essaie 1) localStorage userRole, sinon 2) lecture du JWT (claim role / roles) */
  getRole(): string | null {
    return localStorage.getItem(this.ROLE_KEY);

  }

  hasAnyRole(allowed: string): boolean {
    const r = this.getRole();
    return !!r && allowed.includes(r);
  }
}
