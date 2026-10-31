"""Repositorio de entradas de inventario."""

from datetime import date
from typing import Any

from app.repositories.base_repository import BaseRepository


class EntradaRepository(BaseRepository):
    def registrar(
        self,
        *,
        id_producto: int,
        cantidad: int,
        motivo: str,
        id_usuario: int,
        numero_lote: str | None = None,
        fecha_vencimiento: date | None = None,
    ) -> dict[str, Any] | None:
        return self._exec_one(
            "sp_entrada_registrar",
            [
                ("id_producto", id_producto),
                ("cantidad", cantidad),
                ("motivo", motivo),
                ("id_usuario", id_usuario),
                ("numero_lote", numero_lote),
                ("fecha_vencimiento", fecha_vencimiento),
            ],
        )
