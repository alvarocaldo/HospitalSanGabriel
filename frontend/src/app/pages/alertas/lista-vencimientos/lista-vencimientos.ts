import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ProductoPorVencer, ProductoVencido } from '../../../core/models/dashboard.model';
import { DashboardService } from '../../../core/services/dashboard.service';
import { obtenerMensajeError } from '../../../core/utils/http-error';
import { Icon } from '../../../shared/icon/icon';

type Pestana = 'proximos' | 'vencidos';

interface FilaVencimiento {
  id: string;
  id_producto: number;
  codigo: string;
  nombre: string;
  categoria: string;
  numero_lote: string | null;
  fecha_vencimiento: string;
  dias: number;
  stock_actual: number;
  origen: string;
  vencido: boolean;
}

const OPCIONES_DIAS = [7, 15, 30, 60, 90] as const;

@Component({
  selector: 'app-lista-vencimientos',
  imports: [RouterLink, Icon, DatePipe, DecimalPipe],
  templateUrl: './lista-vencimientos.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaVencimientosPage implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  protected readonly pestana = signal<Pestana>('proximos');
  protected readonly dias = signal<number>(30);
  protected readonly opcionesDias = OPCIONES_DIAS;
  protected readonly proximos = signal<ProductoPorVencer[]>([]);
  protected readonly vencidos = signal<ProductoVencido[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly filas = computed<FilaVencimiento[]>(() => {
    if (this.pestana() === 'vencidos') {
      return this.vencidos().map((item) => ({
        id: `vencido-${item.id_producto}-${item.numero_lote ?? 'sin-lote'}`,
        id_producto: item.id_producto,
        codigo: item.codigo,
        nombre: item.nombre,
        categoria: item.categoria,
        numero_lote: item.numero_lote,
        fecha_vencimiento: item.fecha_vencimiento,
        dias: item.dias_vencido,
        stock_actual: item.stock_actual,
        origen: item.origen,
        vencido: true,
      }));
    }

    return this.proximos().map((item) => ({
      id: `proximo-${item.id_producto}-${item.numero_lote ?? 'sin-lote'}`,
      id_producto: item.id_producto,
      codigo: item.codigo,
      nombre: item.nombre,
      categoria: item.categoria,
      numero_lote: item.numero_lote,
      fecha_vencimiento: item.fecha_vencimiento,
      dias: item.dias_para_vencer,
      stock_actual: item.stock_actual,
      origen: item.origen,
      vencido: false,
    }));
  });

  protected readonly criticosSieteDias = computed(
    () => this.proximos().filter((item) => item.dias_para_vencer <= 7).length,
  );

  ngOnInit(): void {
    void this.cargar();
  }

  protected async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);

    try {
      const [proximos, vencidos] = await Promise.all([
        firstValueFrom(this.dashboardService.proximosVencer(this.dias())),
        firstValueFrom(this.dashboardService.vencidos()),
      ]);
      this.proximos.set(proximos);
      this.vencidos.set(vencidos);
    } catch (error) {
      this.error.set(obtenerMensajeError(error, 'No se pudieron cargar los vencimientos.'));
    } finally {
      this.cargando.set(false);
    }
  }

  protected cambiarPestana(pestana: Pestana): void {
    this.pestana.set(pestana);
  }

  protected async cambiarDias(dias: number): Promise<void> {
    this.dias.set(dias);
    this.cargando.set(true);
    this.error.set(null);

    try {
      this.proximos.set(await firstValueFrom(this.dashboardService.proximosVencer(dias)));
    } catch (error) {
      this.error.set(obtenerMensajeError(error, 'No se pudieron cargar los próximos vencimientos.'));
    } finally {
      this.cargando.set(false);
    }
  }

  protected severidad(dias: number): string {
    if (dias <= 7) {
      return 'bg-red-50 text-red-700 ring-1 ring-red-600/15';
    }
    if (dias <= 30) {
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/15';
    }
    return 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-600/15';
  }
}
