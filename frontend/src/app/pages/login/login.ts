import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormField, FormRoot, form, minLength, required } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { obtenerMensajeError } from '../../core/utils/http-error';
import { Icon } from '../../shared/icon/icon';

interface LoginFormModel {
  username: string;
  password: string;
}

@Component({
  selector: 'app-login',
  imports: [FormField, FormRoot, Icon],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly model = signal<LoginFormModel>({ username: '', password: '' });
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly showPassword = signal(false);

  protected readonly loginForm = form(
    this.model,
    (path) => {
      required(path.username, { message: 'El nombre de usuario es obligatorio.' });
      minLength(path.username, 3, { message: 'Debe tener al menos 3 caracteres.' });
      required(path.password, { message: 'La contraseña es obligatoria.' });
      minLength(path.password, 4, { message: 'Debe tener al menos 4 caracteres.' });
    },
    {
      submission: {
        action: async () => {
          await this.iniciarSesion();
        },
      },
    },
  );

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      void this.router.navigate(['/dashboard']);
    }
  }

  protected togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  private async iniciarSesion(): Promise<void> {
    this.errorMessage.set(null);

    try {
      await firstValueFrom(this.auth.login(this.model()));
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
      await this.router.navigateByUrl(returnUrl);
    } catch (error) {
      this.errorMessage.set(
        obtenerMensajeError(error, 'No se pudo iniciar sesión. Verifique sus credenciales.'),
      );
    }
  }
}
