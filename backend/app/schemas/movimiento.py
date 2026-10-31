"""Esquemas de movimientos de inventario."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class MovimientoResponse(BaseModel):
    id_movimiento: int
    id_producto: int
    codigo: str
    producto: str
    categoria: str
    id_lote: int | None = None
    numero_lote: str | None = None
    tipo: Literal["ENTRADA", "SALIDA"]
    cantidad: int
    fecha: datetime
    motivo: str
    id_area: int | None = None
    area: str | None = None
    stock_anterior: int
    stock_posterior: int
    id_usuario: int
    usuario: str
