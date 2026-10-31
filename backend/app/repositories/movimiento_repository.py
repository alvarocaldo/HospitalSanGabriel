"""Repositorio de movimientos de inventario."""

from datetime import datetime
from typing import Any

from app.repositories.base_repository import BaseRepository


class MovimientoRepository(BaseRepository):
    def listar(
        self,
        *,
        id_producto: int | None = None,
        tipo: str | None = None,
        id_area: int | None = None,
        fecha_desde: datetime | None = None,
        fecha_hasta: datetime | None = None,
    ) -> list[dict[str, Any]]:
        return self._exec(
            "sp_movimiento_listar",
            [
                ("id_producto", id_producto),
                ("tipo", tipo),
                ("id_area", id_area),
                ("fecha_desde", fecha_desde),
                ("fecha_hasta", fecha_hasta),
            ],
        )
