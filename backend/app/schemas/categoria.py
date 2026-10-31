"""Esquemas de categorías."""

from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class CategoriaBase(BaseModel):
    nombre: str = Field(min_length=1, max_length=100)
    descripcion: str | None = Field(default=None, max_length=255)

    @field_validator("nombre")
    @classmethod
    def validar_nombre(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("El nombre de la categoría es obligatorio.")
        return value

    @field_validator("descripcion")
    @classmethod
    def normalizar_descripcion(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None


class CategoriaCreate(CategoriaBase):
    pass


class CategoriaUpdate(CategoriaBase):
    pass


class CategoriaResponse(CategoriaBase):
    id_categoria: int
    activo: bool
    fecha_creacion: datetime


class CategoriaCreadaResponse(BaseModel):
    id_categoria: int
    message: str = "Categoría creada correctamente."
