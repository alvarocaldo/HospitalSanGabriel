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

import { Entrada } from '../../../core/models/movimiento.model';
import { Producto } from '../../../core/models/producto.model';
import { MovimientoService } from '../../../core/services/movimiento.service';
import { ProductoService } from '../../../core/services/producto.service';
import { obtenerMensajeError } from '../../../core/utils/http-error';
import { FieldError } from '../../../shared/field-error/field-error';
import { Icon } from '../../../shared/icon/icon';

interface EntradaFormModel {
  id_producto: string;
  cantidad: number;
  motivo: string;
  numero_lote: string;
  fecha_vencimiento: string;
}

const MODELO_INICIAL: EntradaFormModel = {
  id_producto: '',
  cantidad: 1,
  motivo: '',
  numero_lote: '',
  fecha_vencimiento: '',
};

@Component({
  selector: 'app-form-entrada',
  imports: [FormField, FormRoot, RouterLink, Icon, FieldError, DecimalPipe],
  templateUrl: './form-entrada.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormEntradaPage implements OnInit {
  private readonly movimientoService = inject(MovimientoService);
  private readonly productoService = inject(ProductoService);
  private readonly route = inject(ActivatedRoute);

  protected readonly productos = signal<Producto[]>([]);
  protected readonly cargandoProductos = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal<string | null>(null);
  protected readonly modelo = signal<EntradaFormModel>({ ...MODELO_INICIAL });
  protected readonly fechaMinima = new Date().toISOString().slice(0, 10);

  protected readonly productoSeleccionado = computed<Producto | null>(() => {
    const id = Number(this.modelo().id_producto);
    if (!id) {
      return null;
    }
    return this.productos().find((producto) => producto.id_producto === id) ?? null;
  });

  protected readonly manejaLote = computed(() => this.productoSeleccionado()?.maneja_lote ?? false);

  protected readonly entradaForm = form(
    this.modelo,
    (path) => {
      disabled(path.id_producto, { when: () => this.cargandoProductos() });

      required(path.id_producto, { message: 'Seleccione el producto que desea ingresar.' });
      required(path.cantidad, { message: 'La cantidad es obligatoria.' });
      min(path.cantidad, 1, { message: 'La cantidad debe ser mayor que 0.' });
      required(path.motivo, { message: 'Indique el motivo de la entrada.' });
      maxLength(path.motivo, 255, { message: 'El motivo no puede superar 255 caracteres.' });

      required(path.numero_lote, {
        when: () => this.manejaLote(),
        message: 'El número de lote es obligatorio para este producto.',
      });
      maxLength(path.numero_lote, 50, { message: 'El lote no puede superar 50 caracteres.' });

      required(path.fecha_vencimiento, {
        when: () => this.manejaLote(),
        message: 'La fecha de vencimiento es obligatoria para este producto.',
      });
      validate(path.fecha_vencimiento, ({ value }) => {
        const fecha = value();
        if (this.manejaLote() && fecha && fecha < this.fechaMinima) {
          return {
            kind: 'minDate',
            message: 'La fecha de vencimiento no puede ser anterior a hoy.',
          };
        }
        return null;
      });
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
    void this.cargarProductos();
  }

  protected async cargarProductos(): Promise<void> {
    this.cargandoProductos.set(true);

    try {
      const data = await firstValueFrom(this.productoService.listar({ solo_activos: true }));
      this.productos.set(data);
    } catch (error) {
      this.error.set(obtenerMensajeError(error, 'No se pudieron cargar los productos.'));
    } finally {
      this.cargandoProductos.set(false);
    }
  }

  protected onProductoChange(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    this.modelo.update((modelo) => ({
      ...modelo,
      id_producto: id,
      numero_lote: '',
      fecha_vencimiento: '',
    }));
  }

  private async registrar(): Promise<void> {
    this.error.set(null);
    this.success.set(null);

    const modelo = this.modelo();
    const producto = this.productoSeleccionado();

    if (!producto) {
      this.error.set('Seleccione un producto válido para registrar la entrada.');
      return;
    }

    const payload: Entrada = {
      id_producto: producto.id_producto,
      cantidad: Number(modelo.cantidad),
      motivo: modelo.motivo.trim(),
      numero_lote: producto.maneja_lote ? modelo.numero_lote.trim() || null : null,
      fecha_vencimiento: producto.maneja_lote ? modelo.fecha_vencimiento || null : null,
    };

    try {
      const respuesta = await firstValueFrom(this.movimientoService.registrarEntrada(payload));
      this.success.set(
        `${respuesta.message} Stock actualizado a ${respuesta.nuevo_stock} ${producto.unidad_medida} de "${producto.nombre}".`,
      );
      this.modelo.set({ ...MODELO_INICIAL });
      this.entradaForm().reset();
      await this.cargarProductos();
    } catch (error) {
      this.error.set(obtenerMensajeError(error, 'No se pudo registrar la entrada.'));
    }
  }
}
