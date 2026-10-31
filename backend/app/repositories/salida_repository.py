"""Repositorio de salidas de inventario."""

from typing import Any

from app.repositories.base_repository import BaseRepository


class SalidaRepository(BaseRepository):
    def registrar(
        self,
        *,
        id_producto: int,
        cantidad: int,
        motivo: str,
        id_area: int,
        id_usuario: int,
        id_lote: int | None = None,
    ) -> dict[str, Any] | None:
        return self._exec_one(
            "sp_salida_registrar",
            [
                ("id_producto", id_producto),
                ("cantidad", cantidad),
                ("motivo", motivo),
                ("id_area", id_area),
                ("id_usuario", id_usuario),
                ("id_lote", id_lote),
            ],
        )
