import { Routes } from '@angular/router';
import { Register } from './pages/register/register';
import { Login } from './pages/login/login';
import { Demandas } from './pages/demandas/demandas';
import { CadastroAtualizacao } from './pages/cadastro-atualizacao/cadastro-atualizacao';
import { VerMais } from './pages/ver-mais/ver-mais';
import { Dashboard } from './pages/dashboard/dashboard';
import { authGuard } from './guards/auth.guard';
import { publicGuard } from './guards/public.guard';
import { ForgotPassword } from './pages/forgot-password/forgot-password';
import { ResendVerification } from './pages/resend-verification/resend-verification';
import { VerifyEmail } from './pages/verify-email/verify-email';
import { ResetPassword } from './pages/reset-password/reset-password';
import { Callback } from './pages/callback/callback';

export const routes: Routes = [
  // 🔓 Rotas públicas
  {
    path: 'login',
    loadComponent: () => Login,
    canActivate: [publicGuard],
  },
  {
    path: 'register',
    loadComponent: () => Register,
    canActivate: [publicGuard],
  },
  {
    path: 'resend-verification',
    loadComponent: () => ResendVerification,
    canActivate: [publicGuard],
  },
  {
    path: 'forgot-password',
    loadComponent: () => ForgotPassword,
    canActivate: [publicGuard],
  },
  {
    path: 'reset-password',
    loadComponent: () => ResetPassword,
    canActivate: [publicGuard],
  },
  {
    path: 'verify-email',
    loadComponent: () => VerifyEmail,
    canActivate: [publicGuard],
  },
  {
    path: 'callback',
    loadComponent: () => Callback,
    canActivate: [publicGuard],
  },

  // 🔐 Rotas protegidas
  {
    path: 'demandas',
    loadComponent: () => Demandas,
    canActivate: [authGuard],
    data: { roles: ['Administrador', 'Normal'] },
  },
  {
    path: 'cadastro-demanda',
    loadComponent: () => CadastroAtualizacao,
    canActivate: [authGuard],
    data: { roles: ['Normal'] },
  },
  {
    path: 'editar-demanda/:id',
    loadComponent: () => CadastroAtualizacao,
    canActivate: [authGuard],
    data: { roles: ['Normal'] },
  },
  {
    path: 'ver-mais/:id',
    loadComponent: () => VerMais,
    canActivate: [authGuard],
    data: { roles: ['Administrador', 'Normal'] },
  },
  {
    path: 'dashboard',
    loadComponent: () => Dashboard,
    canActivate: [authGuard],
    data: { roles: ['Administrador'] },
  },

  // 🔁 Redirecionamento padrão
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  // ⚠️ Rota coringa (caso acesse algo inexistente)
  {
    path: '**',
    redirectTo: 'login',
  },
];
