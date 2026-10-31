import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Categoria } from '../../../core/models/categoria.model';
import { Producto } from '../../../core/models/producto.model';
import { CategoriaService } from '../../../core/services/categoria.service';
import { ProductoService } from '../../../core/services/producto.service';
import { obtenerMensajeError } from '../../../core/utils/http-error';
import { Icon } from '../../../shared/icon/icon';

@Component({
  selector: 'app-lista-productos',
  imports: [RouterLink, Icon, CurrencyPipe, DecimalPipe],
  templateUrl: './lista-productos.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaProductosPage implements OnInit {
  private readonly productoService = inject(ProductoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly route = inject(ActivatedRoute);

  protected readonly productos = signal<Producto[]>([]);
  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal<string | null>(null);
  protected readonly busqueda = signal('');
  protected readonly idCategoria = signal<number | null>(null);
  protected readonly soloActivos = signal(true);
  protected readonly desactivando = signal<number | null>(null);

  private searchTimer: ReturnType<typeof setTimeout> | undefined;

  ngOnInit(): void {
    const creado = this.route.snapshot.queryParamMap.get('creado');
    const actualizado = this.route.snapshot.queryParamMap.get('actualizado');
    if (creado) {
      this.success.set('Producto creado correctamente.');
    } else if (actualizado) {
      this.success.set('Producto actualizado correctamente.');
    }

    void Promise.all([this.cargarCategorias(), this.cargarProductos()]);
  }

  protected async cargarCategorias(): Promise<void> {
    try {
      this.categorias.set(await firstValueFrom(this.categoriaService.listar()));
    } catch {
      this.categorias.set([]);
    }
  }

  protected async cargarProductos(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);

    try {
      const data = await firstValueFrom(
        this.productoService.listar({
          texto: this.busqueda(),
          id_categoria: this.idCategoria() ?? undefined,
          solo_activos: this.soloActivos(),
        }),
      );
      this.productos.set(data);
    } catch (error) {
      this.error.set(obtenerMensajeError(error, 'No se pudieron cargar los productos.'));
    } finally {
      this.cargando.set(false);
    }
  }

  protected onBuscar(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.busqueda.set(valor);

    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    this.searchTimer = setTimeout(() => {
      void this.cargarProductos();
    }, 350);
  }

  protected onCategoriaChange(event: Event): void {
    const valor = (event.target as HTMLSelectElement).value;
    this.idCategoria.set(valor ? Number(valor) : null);
    void this.cargarProductos();
  }

  protected onSoloActivosChange(event: Event): void {
    this.soloActivos.set((event.target as HTMLInputElement).checked);
    void this.cargarProductos();
  }

  protected limpiarFiltros(): void {
    this.busqueda.set('');
    this.idCategoria.set(null);
    this.soloActivos.set(true);
    void this.cargarProductos();
  }

  protected async desactivar(producto: Producto): Promise<void> {
    const confirmado = window.confirm(
      `¿Desea desactivar el producto "${producto.nombre}"?\n\nEl producto no se eliminará y conservará su historial de movimientos.`,
    );
    if (!confirmado) {
      return;
    }

    this.desactivando.set(producto.id_producto);
    this.error.set(null);
    this.success.set(null);

    try {
      await firstValueFrom(this.productoService.desactivar(producto.id_producto));
      this.success.set(`El producto "${producto.nombre}" fue desactivado correctamente.`);
      await this.cargarProductos();
    } catch (error) {
      this.error.set(obtenerMensajeError(error, 'No se pudo desactivar el producto.'));
    } finally {
      this.desactivando.set(null);
    }
  }

  protected stockBajo(producto: Producto): boolean {
    return producto.stock_actual <= producto.stock_minimo;
  }
}
