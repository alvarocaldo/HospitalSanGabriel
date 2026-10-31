"""Esquemas de productos y lotes."""

from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field, field_validator


class ProductoBase(BaseModel):
    codigo: str = Field(min_length=1, max_length=50)
    nombre: str = Field(min_length=1, max_length=150)
    descripcion: str | None = Field(default=None, max_length=500)
    id_categoria: int = Field(gt=0)
    unidad_medida: str = Field(min_length=1, max_length=50)
    precio_unitario: Decimal = Field(gt=0, max_digits=18, decimal_places=2)
    stock_minimo: int = Field(ge=0)
    maneja_lote: bool = False
    fecha_vencimiento: date | None = None

    @field_validator("codigo", "nombre", "unidad_medida")
    @classmethod
    def validar_textos_obligatorios(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Este campo es obligatorio.")
        return value

    @field_validator("descripcion")
    @classmethod
    def normalizar_descripcion(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None


class ProductoCreate(ProductoBase):
    pass


class ProductoUpdate(ProductoBase):
    pass


class ProductoResponse(BaseModel):
    id_producto: int
    codigo: str
    nombre: str
    descripcion: str | None = None
    id_categoria: int
    categoria: str
    unidad_medida: str
    precio_unitario: float
    stock_actual: int
    stock_minimo: int
    maneja_lote: bool
    fecha_vencimiento: date | None = None
    activo: bool
    fecha_creacion: datetime | None = None
    fecha_actualizacion: datetime | None = None


class ProductoCreadoResponse(BaseModel):
    id_producto: int
    message: str = "Producto creado correctamente."


class LoteResponse(BaseModel):
    id_lote: int
    numero_lote: str
    fecha_vencimiento: date
    cantidad_actual: int
    vencido: bool
