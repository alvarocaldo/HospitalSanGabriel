"""Esquemas de entradas de inventario."""

from datetime import date

from pydantic import BaseModel, Field, field_validator


class EntradaCreate(BaseModel):
    id_producto: int = Field(gt=0)
    cantidad: int = Field(gt=0)
    motivo: str = Field(min_length=1, max_length=255)
    numero_lote: str | None = Field(default=None, max_length=50)
    fecha_vencimiento: date | None = None

    @field_validator("motivo")
    @classmethod
    def validar_motivo(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("El motivo es obligatorio.")
        return value

    @field_validator("numero_lote")
    @classmethod
    def normalizar_numero_lote(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None


class EntradaRegistradaResponse(BaseModel):
    id_movimiento: int
    nuevo_stock: int
    message: str = "Entrada registrada correctamente."
