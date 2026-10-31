"""Rutas de salidas de inventario."""

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.schemas.auth import CurrentUser
from app.schemas.salida import SalidaCreate, SalidaRegistradaResponse
from app.services.salida_service import SalidaService

router = APIRouter(prefix="/salidas", tags=["Salidas"])
service = SalidaService()


@router.post(
    "",
    response_model=SalidaRegistradaResponse,
    status_code=201,
    summary="Registrar salida de inventario",
    description=(
        "Registra una salida hacia un área hospitalaria. Para productos que "
        "manejan lote se puede enviar id_lote; si se omite, el SP aplica FEFO."
    ),
)
def registrar_salida(
    payload: SalidaCreate,
    current_user: CurrentUser = Depends(get_current_user),
) -> SalidaRegistradaResponse:
    return service.registrar(payload, current_user)
