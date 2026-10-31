"""Rutas de movimientos de inventario."""

from datetime import date
from typing import Literal

from fastapi import APIRouter, Depends, Query

from app.api.deps import get_current_user
from app.schemas.movimiento import MovimientoResponse
from app.services.movimiento_service import MovimientoService

router = APIRouter(
    prefix="/movimientos",
    tags=["Movimientos"],
    dependencies=[Depends(get_current_user)],
)
service = MovimientoService()


@router.get(
    "",
    response_model=list[MovimientoResponse],
    summary="Listar movimientos de inventario",
)
def listar_movimientos(
    id_producto: int | None = Query(default=None, gt=0),
    tipo: Literal["ENTRADA", "SALIDA"] | None = Query(default=None),
    id_area: int | None = Query(default=None, gt=0),
    fecha_desde: date | None = Query(default=None),
    fecha_hasta: date | None = Query(default=None),
) -> list[MovimientoResponse]:
    return service.listar(
        id_producto=id_producto,
        tipo=tipo,
        id_area=id_area,
        fecha_desde=fecha_desde,
        fecha_hasta=fecha_hasta,
    )
