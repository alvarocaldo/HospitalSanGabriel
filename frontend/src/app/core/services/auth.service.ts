import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, Usuario } from '../models/auth.model';

const TOKEN_KEY = 'hsg_token';
const USER_KEY = 'hsg_usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly tokenSignal = signal<string | null>(this.leerToken());
  readonly currentUser = signal<Usuario | null>(this.leerUsuario());
  readonly isLoggedIn = computed(() => this.isAuthenticated());

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          localStorage.setItem(TOKEN_KEY, response.access_token);
          localStorage.setItem(USER_KEY, JSON.stringify(response.usuario));
          this.tokenSignal.set(response.access_token);
          this.currentUser.set(response.usuario);
        }),
      );
  }

  logout(): void {
    this.limpiarSesion();
    void this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = this.tokenSignal();
    if (!token) {
      return false;
    }
    return !this.tokenExpirado(token);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  private limpiarSesion(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.tokenSignal.set(null);
    this.currentUser.set(null);
  }

  private leerToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private leerUsuario(): Usuario | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as Usuario;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  }

  private tokenExpirado(token: string): boolean {
    try {
      const payload = token.split('.')[1];
      if (!payload) {
        return true;
      }

      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
      const decoded = JSON.parse(atob(padded)) as { exp?: number };

      if (typeof decoded.exp !== 'number') {
        return false;
      }

      return Date.now() >= decoded.exp * 1000;
    } catch {
      return true;
    }
  }
}
