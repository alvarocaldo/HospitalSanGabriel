"""Rutas de entradas de inventario."""

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.schemas.auth import CurrentUser
from app.schemas.entrada import EntradaCreate, EntradaRegistradaResponse
from app.services.entrada_service import EntradaService

router = APIRouter(prefix="/entradas", tags=["Entradas"])
service = EntradaService()


@router.post(
    "",
    response_model=EntradaRegistradaResponse,
    status_code=201,
    summary="Registrar entrada de inventario",
    description=(
        "Registra una entrada y actualiza el stock. Si el producto maneja lote, "
        "es obligatorio enviar numero_lote y fecha_vencimiento."
    ),
)
def registrar_entrada(
    payload: EntradaCreate,
    current_user: CurrentUser = Depends(get_current_user),
) -> EntradaRegistradaResponse:
    return service.registrar(payload, current_user)
