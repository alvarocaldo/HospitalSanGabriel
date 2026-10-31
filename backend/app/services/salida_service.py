"""Servicio de salidas de inventario."""

from app.core.exceptions import AppException
from app.repositories.salida_repository import SalidaRepository
from app.schemas.auth import CurrentUser
from app.schemas.salida import SalidaCreate, SalidaRegistradaResponse


class SalidaService:
    def __init__(self, repository: SalidaRepository | None = None) -> None:
        self.repository = repository or SalidaRepository()

    def registrar(
        self,
        payload: SalidaCreate,
        current_user: CurrentUser,
    ) -> SalidaRegistradaResponse:
        row = self.repository.registrar(
            id_producto=payload.id_producto,
            cantidad=payload.cantidad,
            motivo=payload.motivo,
            id_area=payload.id_area,
            id_usuario=current_user.id_usuario,
            id_lote=payload.id_lote,
        )

        if row is None:
            raise AppException(
                500,
                "No se pudo registrar la salida.",
                code="SALIDA_NO_REGISTRADA",
            )

        return SalidaRegistradaResponse(
            id_movimiento=row["id_movimiento"],
            nuevo_stock=row["nuevo_stock"],
        )
