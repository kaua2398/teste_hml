import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { AuthLayout } from '../../components/auth-layout/auth-layout';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, AuthLayout, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.scss'],
})
export class ForgotPassword {
  email: string = '';
  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.email) {
      this.errorMessage = 'Por favor, insira um e-mail válido.';
      return;
    }

    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.toastr.success(
          'Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.',
          'Solicitação Enviada!'
        );
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Ocorreu um erro. Tente novamente.'; 
      },
    });
  }
}
