"""Esquemas del dashboard e indicadores."""

from datetime import date

from pydantic import BaseModel


class DashboardIndicadores(BaseModel):
    productos_activos: int
    productos_stock_bajo: int
    productos_proximos_vencer: int
    productos_vencidos: int
    valor_inventario: float
    movimientos_ultimos_30_dias: int


class ProductoMayorSalida(BaseModel):
    id_producto: int
    codigo: str
    nombre: str
    categoria: str
    total_salidas: int


class ProductoStockBajo(BaseModel):
    id_producto: int
    codigo: str
    nombre: str
    categoria: str
    stock_actual: int
    stock_minimo: int
    unidad_medida: str


class ProductoPorVencer(BaseModel):
    id_producto: int
    codigo: str
    nombre: str
    categoria: str
    numero_lote: str | None = None
    fecha_vencimiento: date
    dias_para_vencer: int
    stock_actual: int
    origen: str


class ProductoVencido(BaseModel):
    id_producto: int
    codigo: str
    nombre: str
    categoria: str
    numero_lote: str | None = None
    fecha_vencimiento: date
    dias_vencido: int
    stock_actual: int
    origen: str
