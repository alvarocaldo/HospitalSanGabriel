"""Repositorio de indicadores y reportes del dashboard."""

from datetime import datetime
from typing import Any

from app.repositories.base_repository import BaseRepository


class DashboardRepository(BaseRepository):
    def indicadores(self) -> dict[str, Any] | None:
        return self._exec_one("sp_dashboard_indicadores")

    def mayores_salidas(
        self,
        *,
        fecha_desde: datetime,
        fecha_hasta: datetime,
        top_n: int,
    ) -> list[dict[str, Any]]:
        return self._exec(
            "sp_productos_mayores_salidas",
            [
                ("fecha_desde", fecha_desde),
                ("fecha_hasta", fecha_hasta),
                ("top_n", top_n),
            ],
        )

    def stock_bajo(self) -> list[dict[str, Any]]:
        return self._exec("sp_producto_stock_bajo")

    def proximos_vencer(self, dias: int) -> list[dict[str, Any]]:
        return self._exec(
            "sp_producto_proximos_vencer",
            [("dias", dias)],
        )

    def vencidos(self) -> list[dict[str, Any]]:
        return self._exec("sp_producto_vencidos")
