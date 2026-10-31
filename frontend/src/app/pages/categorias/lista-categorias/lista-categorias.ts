import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormField, FormRoot, form, maxLength, required } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';

import { Categoria, CategoriaCreate } from '../../../core/models/categoria.model';
import { CategoriaService } from '../../../core/services/categoria.service';
import { obtenerMensajeError } from '../../../core/utils/http-error';
import { FieldError } from '../../../shared/field-error/field-error';
import { Icon } from '../../../shared/icon/icon';

interface CategoriaFormModel {
  nombre: string;
  descripcion: string;
}

const MODELO_INICIAL: CategoriaFormModel = {
  nombre: '',
  descripcion: '',
};

@Component({
  selector: 'app-lista-categorias',
  imports: [FormField, FormRoot, DatePipe, Icon, FieldError],
  templateUrl: './lista-categorias.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaCategoriasPage implements OnInit {
  private readonly categoriaService = inject(CategoriaService);

  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal<string | null>(null);
  protected readonly busqueda = signal('');
  protected readonly modelo = signal<CategoriaFormModel>({ ...MODELO_INICIAL });
  protected readonly editando = signal<Categoria | null>(null);

  protected readonly filtradas = computed(() => {
    const termino = this.busqueda().trim().toLowerCase();
    if (!termino) {
      return this.categorias();
    }
    return this.categorias().filter(
      (categoria) =>
        categoria.nombre.toLowerCase().includes(termino) ||
        (categoria.descripcion ?? '').toLowerCase().includes(termino),
    );
  });

  protected readonly categoriaForm = form(
    this.modelo,
    (path) => {
      required(path.nombre, { message: 'El nombre de la categoría es obligatorio.' });
      maxLength(path.nombre, 100, { message: 'El nombre no puede superar 100 caracteres.' });
      maxLength(path.descripcion, 255, { message: 'La descripción no puede superar 255 caracteres.' });
    },
    {
      submission: {
        action: async () => {
          await this.guardar();
        },
      },
    },
  );

  ngOnInit(): void {
    void this.cargar();
  }

  protected async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);

    try {
      this.categorias.set(await firstValueFrom(this.categoriaService.listar()));
    } catch (error) {
      this.error.set(obtenerMensajeError(error, 'No se pudieron cargar las categorías.'));
    } finally {
      this.cargando.set(false);
    }
  }

  protected onBuscar(event: Event): void {
    this.busqueda.set((event.target as HTMLInputElement).value);
  }

  protected editar(categoria: Categoria): void {
    this.editando.set(categoria);
    this.modelo.set({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion ?? '',
    });
    this.success.set(null);
    this.error.set(null);
    this.categoriaForm().reset();
  }

  protected cancelarEdicion(): void {
    this.editando.set(null);
    this.modelo.set({ ...MODELO_INICIAL });
    this.categoriaForm().reset();
  }

  private async guardar(): Promise<void> {
    this.error.set(null);
    this.success.set(null);

    const modelo = this.modelo();
    const payload: CategoriaCreate = {
      nombre: modelo.nombre.trim(),
      descripcion: modelo.descripcion.trim() || null,
    };
    const categoriaEditada = this.editando();

    try {
      if (categoriaEditada) {
        await firstValueFrom(this.categoriaService.actualizar(categoriaEditada.id_categoria, payload));
        this.success.set(`La categoría "${payload.nombre}" fue actualizada correctamente.`);
      } else {
        await firstValueFrom(this.categoriaService.crear(payload));
        this.success.set(`La categoría "${payload.nombre}" fue creada correctamente.`);
      }

      this.editando.set(null);
      this.modelo.set({ ...MODELO_INICIAL });
      this.categoriaForm().reset();
      await this.cargar();
    } catch (error) {
      this.error.set(
        obtenerMensajeError(
          error,
          categoriaEditada ? 'No se pudo actualizar la categoría.' : 'No se pudo crear la categoría.',
        ),
      );
    }
  }
}
