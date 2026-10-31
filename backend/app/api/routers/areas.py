"""Rutas de áreas hospitalarias."""

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.schemas.area import AreaResponse
from app.services.area_service import AreaService

router = APIRouter(
    prefix="/areas",
    tags=["Áreas hospitalarias"],
    dependencies=[Depends(get_current_user)],
)
service = AreaService()


@router.get(
    "",
    response_model=list[AreaResponse],
    summary="Listar áreas hospitalarias activas",
)
def listar_areas() -> list[AreaResponse]:
    return service.listar()
