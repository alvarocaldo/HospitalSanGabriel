export interface DashboardIndicadores {
  productos_activos: number;
  productos_stock_bajo: number;
  productos_proximos_vencer: number;
  productos_vencidos: number;
  valor_inventario: number;
  movimientos_ultimos_30_dias: number;
}

export interface ProductoMayorSalida {
  id_producto: number;
  codigo: string;
  nombre: string;
  categoria: string;
  total_salidas: number;
}

export interface ProductoStockBajo {
  id_producto: number;
  codigo: string;
  nombre: string;
  categoria: string;
  stock_actual: number;
  stock_minimo: number;
  unidad_medida: string;
}

export interface ProductoPorVencer {
  id_producto: number;
  codigo: string;
  nombre: string;
  categoria: string;
  numero_lote: string | null;
  fecha_vencimiento: string;
  dias_para_vencer: number;
  stock_actual: number;
  origen: string;
}

export interface ProductoVencido {
  id_producto: number;
  codigo: string;
  nombre: string;
  categoria: string;
  numero_lote: string | null;
  fecha_vencimiento: string;
  dias_vencido: number;
  stock_actual: number;
  origen: string;
}
