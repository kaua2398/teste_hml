import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthLayout } from '../../components/auth-layout/auth-layout';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AuthLayout,
    RouterLink
  ],
  templateUrl: './resend-verification.html',
  styleUrls: ['./resend-verification.scss']
})
export class ResendVerification {
  email: string = '';
  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  onSubmit(): void {
    if (!this.email) {
      this.errorMessage = 'Por favor, preencha o e-mail.';
      return;
    }

    this.errorMessage = null;
    this.authService.resendVerifyEmail(this.email).subscribe({
      next: (response) => {
        this.toastr.success('E-mail de verificação reenviado com sucesso! Por favor, verifique o seu e-mail.', 'Sucesso!');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Erro ao reenviar o e-mail de verificação. Por favor, tente novamente.';
      }
    });
  }
}
