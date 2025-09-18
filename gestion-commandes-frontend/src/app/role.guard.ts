// src/app/core/role.guard.ts
import { CanActivateFn, CanActivateChildFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth/services/auth.service';

function checkRoles(route: ActivatedRouteSnapshot): boolean {
  const auth = inject(AuthService);
  const router = inject(Router);

  const role = route.data?.['role'] as string | undefined;
  if (!role ) return true; // pas de contrainte de rôle

  if (auth.hasAnyRole(role)) return true;

  // rôle non autorisé → tu peux rediriger vers une page 403 ou dashboard
  router.navigate(['/login']);
  return false;
}

export const roleGuard: CanActivateFn = (route) => checkRoles(route);
export const roleChildGuard: CanActivateChildFn = (route) => checkRoles(route);
