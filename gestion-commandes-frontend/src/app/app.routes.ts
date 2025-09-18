// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { GestionComptesComponent } from './gestion-comptes/gestion-comptes.component';

import { DashboardDaComponent } from './dashboardDirecteur/dashboard.component';
import { GestionArticles } from './dashboardDirecteur/gestion-articles/gestion-articles';
import { GestionCategories } from './dashboardDirecteur/gestion-categories/gestion-categories';
import { GestionStock } from './dashboardDirecteur/gestion-stock/gestion-stock';

import { authGuard } from './auth.guard';
import { roleGuard, roleChildGuard } from './role.guard';

export const routes: Routes = [
  // public
  
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },

  // admin (ex: ADMIN)
  {
    path: 'gestion-comptes',
    component: GestionComptesComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'Admin' }
  },

  // directeur administratif (ex: DIRECTEUR_ADMINISTRATIF)
  {
    path: 'dashboard',
    component: DashboardDaComponent,
    canActivate: [authGuard, roleGuard],
    canActivateChild: [authGuard, roleChildGuard],
    data: { role: 'Directeur_admin' },
    children: [
      { path: 'articles', component: GestionArticles },
      { path: 'categories', component: GestionCategories },
      { path: 'stock', component: GestionStock },
      { path: '', redirectTo: 'articles', pathMatch: 'full' }
    ]
  },

  // utilisateur simple (ex: UTILISATEUR_SIMPLE)
  {
    path: 'user-dashboard',
    loadComponent: () => import('./dashboardUser/dashboard.component').then(m => m.UserDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'Utilisateur_simple' }
  },

  // manager (ex: MANAGER)
  {
    path: 'manager-dashboard',
    loadComponent: () => import('./dashboardManager/dashboard.component').then(m => m.ManagerDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'Manager' }
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
