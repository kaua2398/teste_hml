import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PainelService {

  private apiUrl = environment.apiUrl;

  private _authService: AuthService | undefined;
  private get authService(): AuthService {
    if (!this._authService) {
      this._authService = this.injector.get(AuthService);
    }
    return this._authService;
  }

  constructor(private http: HttpClient, private injector: Injector) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // USER ROUTES
  registerUser(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/register`, userData);
  }

  verifyEmail(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/verify-email?token=${token}`);
  }

  resendVerifyEmail(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/resend-verification`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/login`, credentials);
  }

  forgotPassword(email: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/forgot-password`, email);
  }

  resetPassword(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/reset-password`, data);
  }

  getAuthenticatedUserProfile(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/users/profile`, { headers });
  }

  getAllUsers(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/users/all`, { headers });
  }


  // DEMAND ROUTES
  registerDemand(demandData: any): Observable<any> {
    console.log("Registrando demanda com dados: ", demandData);
    const headers = this.getAuthHeaders();
    console.log("Registrando demanda de: ", headers);
    return this.http.post(`${this.apiUrl}/demands`, demandData, { headers });
  }

  updateDemand(demandId: number, demandData: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch(`${this.apiUrl}/demands/update/${demandId}`, demandData, { headers });
  }

  registerProblemObservationOrComment(demandId: number, data: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch(`${this.apiUrl}/demands/register/${demandId}`, data, { headers });
  }

  updateProblemObservationOrComment(demandId: number, index: number, data: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch(`${this.apiUrl}/demands/${demandId}/${index}`, data, { headers });
  }

  getAllDemandRecord(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/demands/all`, { headers });
  }

  getUserAllDemandRecord(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/demands`, { headers });
  }

  getDemandById(demandId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/demands/${demandId}`, { headers });
  }

  deleteProblem(demandId: number, index: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/demands/problem/${demandId}/${index}`, { headers });
  }

  deleteObservation(demandId: number, index: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/demands/observation/${demandId}/${index}`, { headers });
  }

  deleteComment(demandId: number, index: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/demands/comment/${demandId}/${index}`, { headers });
  }

  deleteDemand(demandId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/demands/${demandId}`, { headers });
  }
}

