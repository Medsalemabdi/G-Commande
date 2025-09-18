import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './models/user.model';
import { Role } from './models/role.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private baseUrl = '/api/users';

  constructor(private http: HttpClient) {}

  // Récupère tous les utilisateurs
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  
  // Récupère tous les rôles disponibles
  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.baseUrl}/roles`);
  }

  // Récupère uniquement les managers
  getManagers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/managers`);
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${userId}`);
  }

  updateUserStatus(userId: number, isActive: boolean): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/${userId}/status`, { isActive });
  }

  addUser(user: User): Observable<User> {
  return this.http.post<User>('/api/auth/signup', user, { observe: 'body' });
}
  isAdmin(): boolean {
    return localStorage.getItem('userRole') === 'Admin';
  }
  getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }
}