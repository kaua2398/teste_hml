import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class Header {
  isLoggedIn$: Observable<boolean>;
  isAdmin$: Observable<boolean>;

  isHidden = false;
  isMenuOpen = false;
  private lastScrollY = 0;

  constructor(private authService: AuthService, private router: Router) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.isAdmin$ = this.authService.isAdmin$;
  }

  logout() {
    this.authService.logout();
    this.isMenuOpen = false; // Fecha o menu ao deslogar
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    const currentScrollY = window.scrollY;

    if (currentScrollY > this.lastScrollY && currentScrollY > 60) {
      this.isHidden = true;
      this.isMenuOpen = false; // Fecha o menu ao rolar
    } else {
      this.isHidden = false;
    }

    this.lastScrollY = currentScrollY;
  }
}
