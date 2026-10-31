"""Servicio de movimientos de inventario."""

from datetime import date

from app.core.exceptions import AppException
from app.core.utils import end_of_day, start_of_day
from app.repositories.movimiento_repository import MovimientoRepository
from app.schemas.movimiento import MovimientoResponse


class MovimientoService:
    def __init__(self, repository: MovimientoRepository | None = None) -> None:
        self.repository = repository or MovimientoRepository()

    def listar(
        self,
        *,
        id_producto: int | None = None,
        tipo: str | None = None,
        id_area: int | None = None,
        fecha_desde: date | None = None,
        fecha_hasta: date | None = None,
    ) -> list[MovimientoResponse]:
        if fecha_desde and fecha_hasta and fecha_desde > fecha_hasta:
            raise AppException(
                400,
                "La fecha desde no puede ser mayor que la fecha hasta.",
                code="RANGO_FECHAS_INVALIDO",
            )

        rows = self.repository.listar(
            id_producto=id_producto,
            tipo=tipo,
            id_area=id_area,
            fecha_desde=start_of_day(fecha_desde) if fecha_desde else None,
            fecha_hasta=end_of_day(fecha_hasta) if fecha_hasta else None,
        )
        return [MovimientoResponse.model_validate(row) for row in rows]
