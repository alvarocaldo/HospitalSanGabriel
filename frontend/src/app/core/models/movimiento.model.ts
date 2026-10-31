export type TipoMovimiento = 'ENTRADA' | 'SALIDA';

export interface Entrada {
  id_producto: number;
  cantidad: number;
  motivo: string;
  numero_lote?: string | null;
  fecha_vencimiento?: string | null;
}

export interface Salida {
  id_producto: number;
  cantidad: number;
  motivo: string;
  id_area: number;
  id_lote?: number | null;
}

export interface EntradaRegistradaResponse {
  id_movimiento: number;
  nuevo_stock: number;
  message: string;
}

export interface SalidaRegistradaResponse {
  id_movimiento: number;
  nuevo_stock: number;
  message: string;
}

export interface Movimiento {
  id_movimiento: number;
  id_producto: number;
  codigo: string;
  producto: string;
  categoria: string;
  id_lote: number | null;
  numero_lote: string | null;
  tipo: TipoMovimiento;
  cantidad: number;
  fecha: string;
  motivo: string;
  id_area: number | null;
  area: string | null;
  stock_anterior: number;
  stock_posterior: number;
  id_usuario: number;
  usuario: string;
}

export interface MovimientoFiltros {
  id_producto?: number;
  tipo?: TipoMovimiento;
  id_area?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
}
