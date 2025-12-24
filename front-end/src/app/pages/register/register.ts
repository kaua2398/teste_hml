import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthLayout } from '../../components/auth-layout/auth-layout';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    AuthLayout
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  credentials = {
    email: '',
    password: '',
    confirmPassword: ''
  }
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) { } 

  onSubmit(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (!this.credentials.email || !this.credentials.password || !this.credentials.confirmPassword) {
      this.errorMessage = 'Por favor, preencha todos os campos.';
      return;
    }

    if (this.credentials.password !== this.credentials.confirmPassword) {
      this.errorMessage = 'As senhas não coincidem.';
      return;
    }

    const registerData = {
      email: this.credentials.email,
      password: this.credentials.password
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.toastr.success('Conta criada com sucesso! Por favor, verifique o seu email!', 'Sucesso!');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        const message = err.error?.message || 'Erro ao registrar. O e-mail já pode estar em uso.';
        this.toastr.error(message, 'Erro!');
      }
    });
  }
}

