import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { AuthLayout } from '../../components/auth-layout/auth-layout';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [
    CommonModule,
    AuthLayout,
    RouterLink
  ],
  templateUrl: './verify-email.html',
  styleUrls: ['./verify-email.scss'],
})
export class VerifyEmail implements OnInit {
  verificationStatus: 'verifying' | 'success' | 'error' = 'verifying';
  message: string = 'Verificando seu e-mail, por favor aguarde...';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.verificationStatus = 'error';
      this.message =
        'Token de verificação não encontrado. Por favor, tente novamente.';
      this.toastr.error(this.message, 'Erro de Verificação');
      return;
    }

    this.authService.verifyEmail(token).subscribe({
      next: () => {
        this.verificationStatus = 'success';
        this.message =
          'E-mail verificado com sucesso! Você será redirecionado para a página de login.';
        this.toastr.success('E-mail verificado com sucesso!', 'Sucesso!');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 5000);
      },
      error: (err) => {
        this.verificationStatus = 'error';
        this.message =
          err.error?.message ||
          'Ocorreu um erro ao verificar seu e-mail. O token pode ser inválido ou ter expirado. Por favor, solicite um novo link.';
        this.toastr.error(this.message, 'Erro de Verificação');
      },
    });
  }
}
