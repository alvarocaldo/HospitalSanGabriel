export interface Producto {
  id_producto: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  id_categoria: number;
  categoria: string;
  unidad_medida: string;
  precio_unitario: number;
  stock_actual: number;
  stock_minimo: number;
  maneja_lote: boolean;
  fecha_vencimiento: string | null;
  activo: boolean;
  fecha_creacion: string | null;
  fecha_actualizacion: string | null;
}

export interface ProductoCreate {
  codigo: string;
  nombre: string;
  descripcion: string | null;
  id_categoria: number;
  unidad_medida: string;
  precio_unitario: number;
  stock_minimo: number;
  maneja_lote: boolean;
  fecha_vencimiento: string | null;
}

export type ProductoUpdate = ProductoCreate;

export interface ProductoCreadoResponse {
  id_producto: number;
  message: string;
}

export interface Lote {
  id_lote: number;
  numero_lote: string;
  fecha_vencimiento: string;
  cantidad_actual: number;
  vencido: boolean;
}

export interface ProductoFiltros {
  texto?: string;
  id_categoria?: number;
  solo_activos?: boolean;
}
