import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  FormField,
  FormRoot,
  disabled,
  form,
  maxLength,
  min,
  required,
  validate,
} from '@angular/forms/signals';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Area } from '../../../core/models/area.model';
import { Salida } from '../../../core/models/movimiento.model';
import { Lote, Producto } from '../../../core/models/producto.model';
import { AreaService } from '../../../core/services/area.service';
import { MovimientoService } from '../../../core/services/movimiento.service';
import { ProductoService } from '../../../core/services/producto.service';
import { esErrorDeStock, obtenerMensajeError } from '../../../core/utils/http-error';
import { FieldError } from '../../../shared/field-error/field-error';
import { Icon } from '../../../shared/icon/icon';

interface SalidaFormModel {
  id_producto: string;
  cantidad: number;
  motivo: string;
  id_area: string;
  id_lote: string;
}

const MODELO_INICIAL: SalidaFormModel = {
  id_producto: '',
  cantidad: 1,
  motivo: '',
  id_area: '',
  id_lote: '',
};

@Component({
  selector: 'app-form-salida',
  imports: [FormField, FormRoot, RouterLink, Icon, FieldError, DecimalPipe],
  templateUrl: './form-salida.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormSalidaPage implements OnInit {
  private readonly movimientoService = inject(MovimientoService);
  private readonly productoService = inject(ProductoService);
  private readonly areaService = inject(AreaService);
  private readonly route = inject(ActivatedRoute);

  protected readonly productos = signal<Producto[]>([]);
  protected readonly areas = signal<Area[]>([]);
  protected readonly lotes = signal<Lote[]>([]);
  protected readonly cargandoCatalogos = signal(true);
  protected readonly cargandoLotes = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly errorStock = signal<string | null>(null);
  protected readonly success = signal<string | null>(null);
  protected readonly modelo = signal<SalidaFormModel>({ ...MODELO_INICIAL });

  protected readonly productoSeleccionado = computed<Producto | null>(() => {
    const id = Number(this.modelo().id_producto);
    if (!id) {
      return null;
    }
    return this.productos().find((producto) => producto.id_producto === id) ?? null;
  });

  protected readonly manejaLote = computed(() => this.productoSeleccionado()?.maneja_lote ?? false);

  protected readonly lotesDisponibles = computed(() =>
    this.lotes().filter((lote) => !lote.vencido && lote.cantidad_actual > 0),
  );

  protected readonly porcentajeConsumo = computed(() => {
    const producto = this.productoSeleccionado();
    const cantidad = Number(this.modelo().cantidad) || 0;
    if (!producto || producto.stock_actual <= 0) {
      return 0;
    }
    return Math.min(100, Math.round((cantidad / producto.stock_actual) * 100));
  });

  protected readonly salidaForm = form(
    this.modelo,
    (path) => {
      disabled(path.id_producto, { when: () => this.cargandoCatalogos() });
      disabled(path.id_area, { when: () => this.cargandoCatalogos() });
      disabled(path.id_lote, { when: () => this.cargandoLotes() });

      required(path.id_producto, { message: 'Seleccione el producto que desea despachar.' });
      required(path.id_area, { message: 'Seleccione el área hospitalaria de destino.' });
      required(path.cantidad, { message: 'La cantidad es obligatoria.' });
      min(path.cantidad, 1, { message: 'La cantidad debe ser mayor que 0.' });
      validate(path.cantidad, ({ value }) => {
        const producto = this.productoSeleccionado();
        const cantidad = value();
        if (producto && cantidad > producto.stock_actual) {
          return {
            kind: 'max',
            message: `Solo hay ${producto.stock_actual} ${producto.unidad_medida} disponibles.`,
          };
        }
        return null;
      });
      required(path.motivo, { message: 'Indique el motivo de la salida.' });
      maxLength(path.motivo, 255, { message: 'El motivo no puede superar 255 caracteres.' });
    },
    {
      submission: {
        action: async () => {
          await this.registrar();
        },
      },
    },
  );

  ngOnInit(): void {
    const productoId = this.route.snapshot.queryParamMap.get('producto');
    if (productoId) {
      this.modelo.update((modelo) => ({ ...modelo, id_producto: productoId }));
    }
    void this.cargarCatalogos();
  }

  protected async cargarCatalogos(): Promise<void> {
    this.cargandoCatalogos.set(true);

    try {
      const [productos, areas] = await Promise.all([
        firstValueFrom(this.productoService.listar({ solo_activos: true })),
        firstValueFrom(this.areaService.listar()),
      ]);
      this.productos.set(productos);
      this.areas.set(areas);

      if (this.productoSeleccionado()?.maneja_lote) {
        await this.cargarLotes(this.productoSeleccionado()!.id_producto);
      }
    } catch (error) {
      this.error.set(obtenerMensajeError(error, 'No se pudieron cargar los catálogos.'));
    } finally {
      this.cargandoCatalogos.set(false);
    }
  }

  protected async onProductoChange(event: Event): Promise<void> {
    const id = (event.target as HTMLSelectElement).value;
    this.modelo.update((modelo) => ({
      ...modelo,
      id_producto: id,
      id_lote: '',
      cantidad: 1,
    }));
    this.lotes.set([]);

    const producto = this.productos().find((item) => String(item.id_producto) === id);
    if (producto?.maneja_lote) {
      await this.cargarLotes(producto.id_producto);
    }
  }

  protected async cargarLotes(idProducto: number): Promise<void> {
    this.cargandoLotes.set(true);

    try {
      const lotes = await firstValueFrom(this.productoService.listarLotes(idProducto));
      if (this.productoSeleccionado()?.id_producto === idProducto) {
        this.lotes.set(lotes);
      }
    } catch {
      this.lotes.set([]);
    } finally {
      this.cargandoLotes.set(false);
    }
  }

  private async registrar(): Promise<void> {
    this.error.set(null);
    this.errorStock.set(null);
    this.success.set(null);

    const modelo = this.modelo();
    const producto = this.productoSeleccionado();

    if (!producto) {
      this.error.set('Seleccione un producto válido para registrar la salida.');
      return;
    }

    const payload: Salida = {
      id_producto: producto.id_producto,
      cantidad: Number(modelo.cantidad),
      motivo: modelo.motivo.trim(),
      id_area: Number(modelo.id_area),
      id_lote: modelo.id_lote ? Number(modelo.id_lote) : null,
    };

    try {
      const respuesta = await firstValueFrom(this.movimientoService.registrarSalida(payload));
      this.success.set(
        `${respuesta.message} Stock restante de "${producto.nombre}": ${respuesta.nuevo_stock} ${producto.unidad_medida}.`,
      );
      this.modelo.set({ ...MODELO_INICIAL });
      this.lotes.set([]);
      this.salidaForm().reset();
      await this.cargarCatalogos();
    } catch (error) {
      const mensaje = obtenerMensajeError(error, 'No se pudo registrar la salida.');
      if (esErrorDeStock(error)) {
        this.errorStock.set(mensaje);
      } else {
        this.error.set(mensaje);
      }
    }
  }
}
