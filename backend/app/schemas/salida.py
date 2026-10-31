"""Esquemas de salidas de inventario."""

from pydantic import BaseModel, Field, field_validator


class SalidaCreate(BaseModel):
    id_producto: int = Field(gt=0)
    cantidad: int = Field(gt=0)
    motivo: str = Field(min_length=1, max_length=255)
    id_area: int = Field(gt=0)
    id_lote: int | None = Field(default=None, gt=0)

    @field_validator("motivo")
    @classmethod
    def validar_motivo(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("El motivo es obligatorio.")
        return value


class SalidaRegistradaResponse(BaseModel):
    id_movimiento: int
    nuevo_stock: int
    message: str = "Salida registrada correctamente."
