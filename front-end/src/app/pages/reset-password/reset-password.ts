import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PainelService } from '../../services/painel.service'; // Use PainelService
import { AuthLayout } from '../../components/auth-layout/auth-layout';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AuthLayout,
    RouterLink
  ],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.scss']
})
export class ResetPassword implements OnInit {
  resetPasswordForm: FormGroup;
  token: string | null = null;
  errorMessage: string | null = null;
  isLoading = false;

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private painelService = inject(PainelService); // Inject PainelService
  private toastr = inject(ToastrService);
  private router = inject(Router);

  constructor() {
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Tenta obter o token da query string primeiro (link do email)
    this.token = this.route.snapshot.queryParamMap.get('token');

    // Se não encontrar na query string, tenta obter do parâmetro de rota (caso navegue manualmente)
    if (!this.token) {
       this.token = this.route.snapshot.paramMap.get('token');
    }

    if (!this.token) {
      this.errorMessage = 'Token de redefinição inválido ou ausente.';
      this.toastr.error(this.errorMessage, 'Erro');
      // Opcional: Redirecionar para login ou forgot-password
      // this.router.navigate(['/login']);
    }
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('newPassword')?.value === form.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onSubmit(): void {
    this.errorMessage = null;
    if (this.resetPasswordForm.invalid || !this.token) {
      if (this.resetPasswordForm.hasError('mismatch')) {
        this.errorMessage = 'As senhas não coincidem.';
      } else {
        this.errorMessage = 'Por favor, preencha a nova senha corretamente (mínimo 6 caracteres).';
      }
      return;
    }

    this.isLoading = true;
    const { newPassword } = this.resetPasswordForm.value;
    const resetData = { token: this.token, newPassword };

    this.painelService.resetPassword(resetData).subscribe({ // Use PainelService
      next: () => {
        this.isLoading = false;
        this.toastr.success('Senha redefinida com sucesso! Você já pode fazer login com a nova senha.', 'Sucesso!');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Erro ao redefinir a senha. O token pode ser inválido ou ter expirado.';
      }
    });
  }
}
