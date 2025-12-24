import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs';

export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn$.pipe(
    take(1),
    map(isLoggedIn => {
      if (isLoggedIn) {
        const user = authService.getCurrentUser(); 
        if (user?.userType?.toLowerCase() === 'administrador') {
          router.navigate(['/dashboard']);
        } else {
          router.navigate(['/demandas']);
        }
        return false; 
      }
      return true; 
    })
  );
};
