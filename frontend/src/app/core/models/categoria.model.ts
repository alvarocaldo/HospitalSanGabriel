export interface Categoria {
  id_categoria: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  fecha_creacion: string;
}

export interface CategoriaCreate {
  nombre: string;
  descripcion: string | null;
}

export type CategoriaUpdate = CategoriaCreate;

export interface CategoriaCreadaResponse {
  id_categoria: number;
  message: string;
}
