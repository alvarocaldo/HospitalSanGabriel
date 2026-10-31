import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { DashboardIndicadores } from '../../core/models/dashboard.model';
import { DashboardService } from '../../core/services/dashboard.service';
import { obtenerMensajeError } from '../../core/utils/http-error';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, Icon, CurrencyPipe, DecimalPipe, DatePipe],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  protected readonly indicadores = signal<DashboardIndicadores | null>(null);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly hoy = new Date();

  ngOnInit(): void {
    void this.cargar();
  }

  protected async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);

    try {
      const data = await firstValueFrom(this.dashboardService.indicadores());
      this.indicadores.set(data);
    } catch (error) {
      this.error.set(obtenerMensajeError(error, 'No se pudieron cargar los indicadores.'));
    } finally {
      this.cargando.set(false);
    }
  }
}
