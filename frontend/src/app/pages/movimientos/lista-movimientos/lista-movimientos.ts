import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Movimiento, TipoMovimiento } from '../../../core/models/movimiento.model';
import { Producto } from '../../../core/models/producto.model';
import { MovimientoService } from '../../../core/services/movimiento.service';
import { ProductoService } from '../../../core/services/producto.service';
import { obtenerMensajeError } from '../../../core/utils/http-error';
import { Icon } from '../../../shared/icon/icon';

type RangoRapido = 'hoy' | '7dias' | 'mes' | 'todo';

@Component({
  selector: 'app-lista-movimientos',
  imports: [RouterLink, Icon, DatePipe, DecimalPipe],
  templateUrl: './lista-movimientos.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaMovimientosPage implements OnInit {
  private readonly movimientoService = inject(MovimientoService);
  private readonly productoService = inject(ProductoService);

  protected readonly movimientos = signal<Movimiento[]>([]);
  protected readonly productos = signal<Producto[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly tipo = signal<TipoMovimiento | ''>('');
  protected readonly idProducto = signal<number | null>(null);
  protected readonly fechaDesde = signal('');
  protected readonly fechaHasta = signal('');
  protected readonly rangoActivo = signal<RangoRapido>('todo');

  protected readonly totalEntradas = computed(
    () => this.movimientos().filter((movimiento) => movimiento.tipo === 'ENTRADA').length,
  );
  protected readonly totalSalidas = computed(
    () => this.movimientos().filter((movimiento) => movimiento.tipo === 'SALIDA').length,
  );
  protected readonly totalUnidades = computed(() =>
    this.movimientos().reduce((total, movimiento) => total + movimiento.cantidad, 0),
  );

  ngOnInit(): void {
    void Promise.all([this.cargarProductos(), this.cargarMovimientos()]);
  }

  protected async cargarProductos(): Promise<void> {
    try {
      this.productos.set(await firstValueFrom(this.productoService.listar({ solo_activos: false })));
    } catch {
      this.productos.set([]);
    }
  }

  protected async cargarMovimientos(): Promise<void> {
    if (this.fechaDesde() && this.fechaHasta() && this.fechaDesde() > this.fechaHasta()) {
      this.error.set('La fecha inicial no puede ser posterior a la fecha final.');
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    try {
      const data = await firstValueFrom(
        this.movimientoService.listar({
          tipo: this.tipo() || undefined,
          id_producto: this.idProducto() ?? undefined,
          fecha_desde: this.fechaDesde() || undefined,
          fecha_hasta: this.fechaHasta() || undefined,
        }),
      );
      this.movimientos.set(data);
    } catch (error) {
      this.error.set(obtenerMensajeError(error, 'No se pudieron cargar los movimientos.'));
    } finally {
      this.cargando.set(false);
    }
  }

  protected onTipoChange(event: Event): void {
    this.tipo.set((event.target as HTMLSelectElement).value as TipoMovimiento | '');
    void this.cargarMovimientos();
  }

  protected onProductoChange(event: Event): void {
    const valor = (event.target as HTMLSelectElement).value;
    this.idProducto.set(valor ? Number(valor) : null);
    void this.cargarMovimientos();
  }

  protected onFechaDesdeChange(event: Event): void {
    this.fechaDesde.set((event.target as HTMLInputElement).value);
    this.rangoActivo.set('todo');
    void this.cargarMovimientos();
  }

  protected onFechaHastaChange(event: Event): void {
    this.fechaHasta.set((event.target as HTMLInputElement).value);
    this.rangoActivo.set('todo');
    void this.cargarMovimientos();
  }

  protected aplicarRango(rango: RangoRapido): void {
    const hoy = new Date();
    this.rangoActivo.set(rango);

    if (rango === 'todo') {
      this.fechaDesde.set('');
      this.fechaHasta.set('');
    } else if (rango === 'hoy') {
      const iso = this.formatearFecha(hoy);
      this.fechaDesde.set(iso);
      this.fechaHasta.set(iso);
    } else if (rango === '7dias') {
      const desde = new Date(hoy);
      desde.setDate(desde.getDate() - 6);
      this.fechaDesde.set(this.formatearFecha(desde));
      this.fechaHasta.set(this.formatearFecha(hoy));
    } else {
      const desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      this.fechaDesde.set(this.formatearFecha(desde));
      this.fechaHasta.set(this.formatearFecha(hoy));
    }

    void this.cargarMovimientos();
  }

  protected limpiarFiltros(): void {
    this.tipo.set('');
    this.idProducto.set(null);
    this.fechaDesde.set('');
    this.fechaHasta.set('');
    this.rangoActivo.set('todo');
    void this.cargarMovimientos();
  }

  private formatearFecha(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }
}
