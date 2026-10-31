"""Servicio del dashboard e indicadores."""

from datetime import date, timedelta

from app.core.exceptions import AppException
from app.core.utils import end_of_day, start_of_day
from app.repositories.dashboard_repository import DashboardRepository
from app.schemas.dashboard import (
    DashboardIndicadores,
    ProductoMayorSalida,
    ProductoPorVencer,
    ProductoStockBajo,
    ProductoVencido,
)


class DashboardService:
    def __init__(self, repository: DashboardRepository | None = None) -> None:
        self.repository = repository or DashboardRepository()

    def indicadores(self) -> DashboardIndicadores:
        row = self.repository.indicadores()
        if row is None:
            raise AppException(
                500,
                "No se pudieron obtener los indicadores.",
                code="INDICADORES_NO_DISPONIBLES",
            )
        return DashboardIndicadores.model_validate(row)

    def mayores_salidas(
        self,
        *,
        fecha_desde: date | None = None,
        fecha_hasta: date | None = None,
        top_n: int = 10,
    ) -> list[ProductoMayorSalida]:
        hasta = fecha_hasta or date.today()
        desde = fecha_desde or (hasta - timedelta(days=30))

        if desde > hasta:
            raise AppException(
                400,
                "La fecha desde no puede ser mayor que la fecha hasta.",
                code="RANGO_FECHAS_INVALIDO",
            )

        rows = self.repository.mayores_salidas(
            fecha_desde=start_of_day(desde),
            fecha_hasta=end_of_day(hasta),
            top_n=top_n,
        )
        return [ProductoMayorSalida.model_validate(row) for row in rows]

    def stock_bajo(self) -> list[ProductoStockBajo]:
        return [
            ProductoStockBajo.model_validate(row)
            for row in self.repository.stock_bajo()
        ]

    def proximos_vencer(self, dias: int = 30) -> list[ProductoPorVencer]:
        return [
            ProductoPorVencer.model_validate(row)
            for row in self.repository.proximos_vencer(dias)
        ]

    def vencidos(self) -> list[ProductoVencido]:
        return [
            ProductoVencido.model_validate(row)
            for row in self.repository.vencidos()
        ]
