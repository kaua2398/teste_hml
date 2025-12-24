import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take, filter } from 'rxjs';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user$.pipe(
    filter(user => user !== undefined),
    take(1),
    map(user => {
      if (!user) {
        router.navigate(['/login']);
        return false;
      }

      const allowedRoles = route.data['roles'] as Array<string>;
      if (!allowedRoles || allowedRoles.length === 0) {
        return true; 
      }

      if (allowedRoles.includes(user.userType)) {
        return true; 
      } else {
        const targetRoute = user.userType?.toLowerCase() === 'administrador' ? '/dashboard' : '/demandas';
        router.navigate([targetRoute]);
        return false;
      }
    })
  );
};

