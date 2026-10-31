import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormField, FormRoot, form, maxLength, min, required } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Categoria } from '../../../core/models/categoria.model';
import { Producto, ProductoCreate } from '../../../core/models/producto.model';
import { CategoriaService } from '../../../core/services/categoria.service';
import { ProductoService } from '../../../core/services/producto.service';
import { obtenerMensajeError } from '../../../core/utils/http-error';
import { FieldError } from '../../../shared/field-error/field-error';
import { Icon } from '../../../shared/icon/icon';

interface ProductoFormModel {
  codigo: string;
  nombre: string;
  descripcion: string;
  id_categoria: string;
  unidad_medida: string;
  precio_unitario: number;
  stock_minimo: number;
  maneja_lote: boolean;
  fecha_vencimiento: string;
}

const MODELO_INICIAL: ProductoFormModel = {
  codigo: '',
  nombre: '',
  descripcion: '',
  id_categoria: '',
  unidad_medida: '',
  precio_unitario: 0,
  stock_minimo: 0,
  maneja_lote: false,
  fecha_vencimiento: '',
};

@Component({
  selector: 'app-form-producto',
  imports: [FormField, FormRoot, RouterLink, Icon, FieldError],
  templateUrl: './form-producto.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormProductoPage implements OnInit {
  private readonly productoService = inject(ProductoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly idProducto = Number(this.route.snapshot.paramMap.get('id')) || null;
  protected readonly esEdicion = this.idProducto !== null;

  protected readonly modelo = signal<ProductoFormModel>({ ...MODELO_INICIAL });
  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly fechaMinima = new Date().toISOString().slice(0, 10);

  protected readonly productoForm = form(
    this.modelo,
    (path) => {
      required(path.codigo, { message: 'El código es obligatorio.' });
      maxLength(path.codigo, 50, { message: 'El código no puede superar 50 caracteres.' });

      required(path.nombre, { message: 'El nombre del producto es obligatorio.' });
      maxLength(path.nombre, 150, { message: 'El nombre no puede superar 150 caracteres.' });
      maxLength(path.descripcion, 500, { message: 'La descripción no puede superar 500 caracteres.' });

      required(path.id_categoria, { message: 'Seleccione una categoría.' });

      required(path.unidad_medida, { message: 'La unidad de medida es obligatoria.' });
      maxLength(path.unidad_medida, 50, { message: 'La unidad no puede superar 50 caracteres.' });

      min(path.precio_unitario, 0.01, { message: 'El precio debe ser mayor que 0.' });
      min(path.stock_minimo, 0, { message: 'El stock mínimo no puede ser negativo.' });
    },
    {
      submission: {
        action: async () => {
          await this.guardar();
        },
      },
    },
  );

  async ngOnInit(): Promise<void> {
    await this.cargarCategorias();

    if (this.idProducto) {
      await this.cargarProducto(this.idProducto);
    }
  }

  protected async cargarCategorias(): Promise<void> {
    try {
      this.categorias.set(await firstValueFrom(this.categoriaService.listar()));
    } catch (error) {
      this.error.set(obtenerMensajeError(error, 'No se pudieron cargar las categorías.'));
    }
  }

  private async cargarProducto(idProducto: number): Promise<void> {
    this.cargando.set(true);

    try {
      const producto: Producto = await firstValueFrom(this.productoService.obtener(idProducto));
      this.modelo.set({
        codigo: producto.codigo,
        nombre: producto.nombre,
        descripcion: producto.descripcion ?? '',
        id_categoria: String(producto.id_categoria),
        unidad_medida: producto.unidad_medida,
        precio_unitario: producto.precio_unitario,
        stock_minimo: producto.stock_minimo,
        maneja_lote: producto.maneja_lote,
        fecha_vencimiento: producto.fecha_vencimiento ?? '',
      });
    } catch (error) {
      this.error.set(obtenerMensajeError(error, 'No se pudo cargar el producto.'));
    } finally {
      this.cargando.set(false);
    }
  }

  private async guardar(): Promise<void> {
    this.error.set(null);
    const modelo = this.modelo();

    const payload: ProductoCreate = {
      codigo: modelo.codigo.trim(),
      nombre: modelo.nombre.trim(),
      descripcion: modelo.descripcion.trim() || null,
      id_categoria: Number(modelo.id_categoria),
      unidad_medida: modelo.unidad_medida.trim(),
      precio_unitario: Number(modelo.precio_unitario),
      stock_minimo: Number(modelo.stock_minimo),
      maneja_lote: modelo.maneja_lote,
      fecha_vencimiento: modelo.fecha_vencimiento || null,
    };

    try {
      if (this.idProducto) {
        await firstValueFrom(this.productoService.actualizar(this.idProducto, payload));
        await this.router.navigate(['/productos'], { queryParams: { actualizado: '1' } });
      } else {
        await firstValueFrom(this.productoService.crear(payload));
        await this.router.navigate(['/productos'], { queryParams: { creado: '1' } });
      }
    } catch (error) {
      this.error.set(
        obtenerMensajeError(
          error,
          this.esEdicion ? 'No se pudo actualizar el producto.' : 'No se pudo crear el producto.',
        ),
      );
    }
  }
}
