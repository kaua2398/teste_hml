import { Component, OnInit, OnDestroy, NgZone, PLATFORM_ID, Inject } from '@angular/core'; 
import { isPlatformBrowser, CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthLayout } from '../../components/auth-layout/auth-layout';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AuthLayout,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login implements OnInit, OnDestroy {
  credentials = {
    email: '',
    password: '',
    rememberMe: false
  };
  errorMessage: string | null = null;
  backendMicrosoftLoginUrl = `${environment.apiUrl}/auth/microsoft`; 

  private messageListener: ((event: MessageEvent) => void) | null = null;
  private popup: Window | null = null; 

  constructor(
    private authService: AuthService,
    private router: Router,
    private zone: NgZone, 
    @Inject(PLATFORM_ID) private platformId: Object 
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.messageListener = (event: MessageEvent) => {
        // --- VALIDAÇÃO DE ORIGEM ---
        // Descomente e ajuste a URL de origem em produção por segurança!
        // const expectedOrigin = 'http://localhost:4200'; // Ou a URL da sua API/Backend que faz o redirect final
        // if (event.origin !== expectedOrigin) {
        //   console.warn(`Mensagem ignorada de origem inesperada: ${event.origin}`);
        //   return;
        // }

        if (this.popup && !this.popup.closed) {
          this.popup.close();
        }

        this.zone.run(() => {
          this.handleMicrosoftLoginCallback(event.data);
        });
      };
      window.addEventListener('message', this.messageListener);
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId) && this.messageListener) {
      window.removeEventListener('message', this.messageListener);
    }
    if (this.popup && !this.popup.closed) {
      this.popup.close();
    }
  }

  onSubmit(): void {
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Por favor, preencha o e-mail e a senha.';
      return;
    }

    this.errorMessage = null;
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.navigateToDashboardOrDemandas(response.userResponseDTO);
      },
      error: (err) => {
        console.error("Erro no login:", err);
        if (err.error?.message === "Usuário desabilitado") {
          this.errorMessage = 'Sua conta está desabilitada. Por favor, verifique seu e-mail ou contate o suporte.';
        } else if (err.status === 401 || err.status === 400 || err.status === 409) {
           this.errorMessage = 'Email ou senha inválidos. Por favor, tente novamente.';
        } else if (err.status === 404){
            this.errorMessage = 'Usuário não encontrado'
        } else {
           this.errorMessage = 'Ocorreu um erro inesperado. Tente novamente mais tarde.';
        }
      }
    });
  }

  loginWithMicrosoft(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return; 
    }
    const width = 600;
    const height = 700;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);

    this.popup = window.open(
      this.backendMicrosoftLoginUrl,
      'MicrosoftLogin',
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
    );

     if (this.popup) {
        this.popup.focus();
     }
  }

  handleMicrosoftLoginCallback(data: any): void {
    console.log("Mensagem recebida do popup:", data); // Para depuração
    if (data && data.success && data.token && data.userResponseDTO) {
      this.errorMessage = null;
      this.authService.processLoginResponse(data, false);
      this.navigateToDashboardOrDemandas(data.userResponseDTO);
    } else if (data && !data.success) {
      this.errorMessage = data.message ;
      this.authService.logout();
    } else {
      console.warn("Recebida mensagem inesperada ou incompleta do popup de login:", data);
      this.errorMessage = 'Ocorreu um erro inesperado durante o login com a Microsoft.';
      this.authService.logout();
    }
  }

  private navigateToDashboardOrDemandas(userResponseDTO: any): void {
    setTimeout(() => {
      this.zone.run(() => { 
        if (userResponseDTO?.userType?.toLowerCase() === 'administrador') {
          this.router.navigate(['/dashboard']);
        } else if (userResponseDTO?.userType?.toLowerCase() === 'normal') {
          this.router.navigate(['/demandas']);
        } else {
          console.warn("Tipo de usuário desconhecido:", userResponseDTO?.userType);
          this.router.navigate(['/login']); 
        }
      });
    }, 0);
  }
}

