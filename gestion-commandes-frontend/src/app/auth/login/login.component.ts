import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginDto , LoginResponse} from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  
})
export class LoginComponent {
  form: FormGroup;
  errorMsg: string | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
  if (this.form.invalid) {
    return;
  }

  const credentials = this.form.value as LoginDto;

  this.auth.login(credentials).subscribe({
    next: (resp) => {
      const body = resp.body as LoginResponse;
      if (body?.token) {
        localStorage.setItem('jwtToken', body.token);
        localStorage.setItem('userRole', body.role); // Stockez le rôle
        
        this.errorMsg = null;

        // Redirection basée sur le rôle
        if (body.role === 'Admin') {
          this.router.navigate(['/gestion-comptes']);
        } else if (body.role === 'Directeur_admin') {
          this.router.navigate(['/dashboard']);
        } else if (body.role === 'Utilisateur_simple') {
          this.router.navigate(['/user-dashboard']);
        } else if (body.role === 'Manager') {
          this.router.navigate(['/manager-dashboard']);
        }

        else {
          this.router.navigate(['/']);
        }
      } else {
        this.errorMsg = 'Réponse inattendue du serveur';
      }
    },
    error: (err) => {
      if (err.status === 401 || err.status === 403) {
        this.errorMsg = 'Identifiants invalides';
      } else {
        this.errorMsg = 'Erreur serveur, réessayez plus tard';
      }
    }
  });
}
}
