"""Servicio de entradas de inventario."""

from app.core.exceptions import AppException
from app.repositories.entrada_repository import EntradaRepository
from app.schemas.auth import CurrentUser
from app.schemas.entrada import EntradaCreate, EntradaRegistradaResponse


class EntradaService:
    def __init__(self, repository: EntradaRepository | None = None) -> None:
        self.repository = repository or EntradaRepository()

    def registrar(
        self,
        payload: EntradaCreate,
        current_user: CurrentUser,
    ) -> EntradaRegistradaResponse:
        row = self.repository.registrar(
            id_producto=payload.id_producto,
            cantidad=payload.cantidad,
            motivo=payload.motivo,
            id_usuario=current_user.id_usuario,
            numero_lote=payload.numero_lote,
            fecha_vencimiento=payload.fecha_vencimiento,
        )

        if row is None:
            raise AppException(
                500,
                "No se pudo registrar la entrada.",
                code="ENTRADA_NO_REGISTRADA",
            )

        return EntradaRegistradaResponse(
            id_movimiento=row["id_movimiento"],
            nuevo_stock=row["nuevo_stock"],
        )
