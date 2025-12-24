import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './callback.html',
  styleUrls: ['./callback.scss']
})
export class Callback implements OnInit {

  errorMessage: string | null = null;
  statusMessage: string = 'Autenticando, por favor aguarde...';

  constructor(
    private route: ActivatedRoute,
    private router: Router, // Injetar Router para possível navegação em erro
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.route.fragment.subscribe({
        next: (fragment) => {
          if (fragment) {
            this.processParams(new URLSearchParams(fragment));
          } else {
            this.processQueryParams();
          }
        },
        error: (err) => {
          this.handleError("Erro ao ler parâmetros da URL: " + (err.message || 'Erro desconhecido'));
        }
      });
    } else {
      this.handleError("Callback não suportado fora do ambiente do navegador.");
    }
  }

  private processQueryParams(): void {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('token') && !params.has('userType') && !params.has('error') && !params.has('code')) {
      this.handleError("Dados de autenticação não encontrados na URL.");
      return;
    }
    this.processParams(params);
  }

  private processParams(params: URLSearchParams): void {
    try {
      if (params.has('error')) {
        const errorDescription = params.get('error_description') || params.get('error') || 'Erro desconhecido do provedor de autenticação.';
        this.handleError(`Falha na autenticação: ${errorDescription}`);
        return;
      }

      const token = params.get('token');
      const userType = params.get('userType');
      const name = params.get('name'); 
      const email = params.get('email'); 

      if (token && userType) {
        const loginData = {
          success: true,
          token: token,
          userResponseDTO: {
            userType: userType,
            name: name,
            email: email
          }
        };

        const targetOrigin = window.location.origin; 

        if (window.opener && !window.opener.closed) {
           window.opener.postMessage(loginData, targetOrigin);
           // window.close(); // Pode ser descomentado se preferir fechar aqui
        } else {
          throw new Error("A janela principal (opener) não foi encontrada ou está fechada. Não foi possível completar o login.");
        }

      } else {
        throw new Error("Dados de autenticação esperados (token, userType) não encontrados nos parâmetros da URL.");
      }

    } catch (e: any) {
      this.handleError(e.message || 'Erro desconhecido ao processar o callback de autenticação.');
    }
  }

  private handleError(message: string): void {
    this.errorMessage = message;
    this.statusMessage = 'Falha na Autenticação';
    console.error('Erro no callback de autenticação:', message);

    try {
        const targetOrigin = window.location.origin;
        if (window.opener && !window.opener.closed) {
            window.opener.postMessage({
            success: false,
            message: message
            }, targetOrigin);
        }
    } catch (openerError) {
      console.error("Não foi possível enviar mensagem de erro para o opener.", openerError);
    }
  }

  closeWindow(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.close();
    }
  }

  redirectToLogin(): void {
    if (isPlatformBrowser(this.platformId)) {
       if (window.opener && !window.opener.closed) {
          window.opener.location.href = '/login'; 
          window.close(); 
       } else {
          window.location.href = '/login';
       }
    }
  }
}

