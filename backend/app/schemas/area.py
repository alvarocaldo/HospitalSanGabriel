"""Esquemas de áreas hospitalarias."""

from pydantic import BaseModel


class AreaResponse(BaseModel):
    id_area: int
    nombre: str
    activo: bool
