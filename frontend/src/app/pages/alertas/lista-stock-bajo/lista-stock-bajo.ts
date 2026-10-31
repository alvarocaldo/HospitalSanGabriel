import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ProductoStockBajo } from '../../../core/models/dashboard.model';
import { DashboardService } from '../../../core/services/dashboard.service';
import { obtenerMensajeError } from '../../../core/utils/http-error';
import { Icon } from '../../../shared/icon/icon';

@Component({
  selector: 'app-lista-stock-bajo',
  imports: [RouterLink, Icon, DecimalPipe],
  templateUrl: './lista-stock-bajo.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaStockBajoPage implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  protected readonly productos = signal<ProductoStockBajo[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly busqueda = signal('');

  protected readonly filtrados = computed(() => {
    const termino = this.busqueda().trim().toLowerCase();
    if (!termino) {
      return this.productos();
    }
    return this.productos().filter(
      (producto) =>
        producto.nombre.toLowerCase().includes(termino) ||
        producto.codigo.toLowerCase().includes(termino) ||
        producto.categoria.toLowerCase().includes(termino),
    );
  });

  protected readonly deficitTotal = computed(() =>
    this.productos().reduce(
      (total, producto) => total + Math.max(0, producto.stock_minimo - producto.stock_actual),
      0,
    ),
  );

  protected readonly sinExistencias = computed(
    () => this.productos().filter((producto) => producto.stock_actual <= 0).length,
  );

  ngOnInit(): void {
    void this.cargar();
  }

  protected async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);

    try {
      this.productos.set(await firstValueFrom(this.dashboardService.stockBajo()));
    } catch (error) {
      this.error.set(obtenerMensajeError(error, 'No se pudieron cargar las alertas de stock.'));
    } finally {
      this.cargando.set(false);
    }
  }

  protected onBuscar(event: Event): void {
    this.busqueda.set((event.target as HTMLInputElement).value);
  }

  protected cobertura(producto: ProductoStockBajo): number {
    if (producto.stock_minimo <= 0) {
      return 100;
    }
    return Math.min(100, Math.round((producto.stock_actual / producto.stock_minimo) * 100));
  }
}
