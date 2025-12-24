import { Injectable, PLATFORM_ID, inject, Injector, Inject } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { PainelService } from './painel.service'; 

interface UserProfile {
  id: number;
  email: string;
  userType: 'Administrador' | 'Normal' | string; 
}

interface LoginResponse {
  token: string;
  userResponseDTO: UserProfile;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<UserProfile | null | undefined>(undefined);

  user$ = this.userSubject.asObservable(); 
  isLoggedIn$: Observable<boolean> = this.user$.pipe(map(user => !!user)); 
  isAdmin$: Observable<boolean> = this.user$.pipe(
    map(user => user?.userType?.toLowerCase() === 'administrador')
  );

  private _painelService: PainelService | undefined;
  private get painelService(): PainelService {
    if (!this._painelService) {
      this._painelService = this.injector.get(PainelService);
    }
    return this._painelService;
  }

  private errorMessageSubject = new BehaviorSubject<string>('');
  errorMessage$ = this.errorMessageSubject.asObservable();
  public errorMessage: string = '';

  constructor(
    private router: Router,
    private injector: Injector,
    @Inject(PLATFORM_ID) private platformId: Object 
  ) {
    this.loadUserFromStorage(); 
  }

  private loadUserFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.userSubject.next(null);
      return;
    }

    let userJson: string | null = null;
    let token: string | null = null;

    try {
      userJson = localStorage.getItem('user');
      token = localStorage.getItem('token');

      if (!userJson || !token) {
        userJson = sessionStorage.getItem('user');
        token = sessionStorage.getItem('token');
      }

      if (userJson && token) {
        const user: UserProfile = JSON.parse(userJson);
        this.userSubject.next(user);
      } else {
        this.userSubject.next(null);
      }
    } catch (error) {
        console.error("Erro ao carregar usuário do storage:", error);
        this.clearStorage(); 
        this.userSubject.next(null);
    }
  }

  getCurrentUser(): UserProfile | null {
    const currentUser = this.userSubject.getValue();
    return currentUser === undefined ? null : currentUser;
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    console.log("Recuperando token de storage: " + (localStorage.getItem('token') || sessionStorage.getItem('token')));
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  login(credentials: { email: string, password: string, rememberMe: boolean }): Observable<LoginResponse> {
    return this.painelService.login(credentials).pipe(
      tap((response: LoginResponse) => {
        this.processLoginResponse(response, credentials.rememberMe);
      }),
      catchError(err => {
        this.handleLoginError(err);
        throw err;
      })
    );
  }

  processLoginResponse(response: LoginResponse | any, rememberMe: boolean): void {
    const user = response?.userResponseDTO;
    const token = response?.token || response; // Aceita token aninhado ou no raiz

    if (!user || typeof user !== 'object' || !token || typeof token !== 'string') {
        console.error("Dados de login inválidos recebidos:", response);
        this.handleLoginError("Resposta de login inválida do servidor.");
        return; // Interrompe se os dados essenciais estiverem faltando
    }

    if (!isPlatformBrowser(this.platformId)) {
        console.warn("Tentativa de processar login fora do browser.");
        return; 
    }

    try {
        const storage = rememberMe ? localStorage : sessionStorage;

        this.clearStorage();

        storage.setItem('user', JSON.stringify(user));
        storage.setItem('token', token);

        this.userSubject.next(user);


    } catch (error) {
        console.error("Erro ao processar e armazenar dados de login:", error);
        this.handleLoginError("Erro ao salvar informações de login.");
    }
  }

  resendVerifyEmail(email: string): Observable<any> {
    return this.painelService.resendVerifyEmail({ email });
  }

  verifyEmail(token: string): Observable<any> {
    return this.painelService.verifyEmail(token);
  }

  forgotPassword(email: string): Observable<any> {
    return this.painelService.forgotPassword({ email });
  }

  register(credentials: { email: string, password: string }): Observable<any> {
    const registerData = {
      ...credentials,
      userType: 'Normal' 
    };
    return this.painelService.registerUser(registerData);
  }

  logout(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.clearStorage(); 
    this.userSubject.next(null); 
    this.router.navigate(['/login']); 
  }

  private clearStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
    }
  }

   private handleLoginError(error: any): void {
      console.error("Erro de autenticação:", error);
      this.clearStorage(); 
      this.userSubject.next(null); 
   }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}

