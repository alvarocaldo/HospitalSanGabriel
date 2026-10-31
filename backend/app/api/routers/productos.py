"""Rutas de productos."""

from fastapi import APIRouter, Depends, Path, Query

from app.api.deps import get_current_user
from app.schemas.common import MessageResponse
from app.schemas.producto import (
    LoteResponse,
    ProductoCreadoResponse,
    ProductoCreate,
    ProductoResponse,
    ProductoUpdate,
)
from app.services.producto_service import ProductoService

router = APIRouter(
    prefix="/productos",
    tags=["Productos"],
    dependencies=[Depends(get_current_user)],
)
service = ProductoService()


@router.get(
    "",
    response_model=list[ProductoResponse],
    summary="Listar productos",
)
def listar_productos(
    texto: str | None = Query(
        default=None,
        max_length=150,
        description="Busca por código o nombre",
    ),
    id_categoria: int | None = Query(default=None, gt=0),
    solo_activos: bool = Query(default=True),
) -> list[ProductoResponse]:
    return service.listar(
        texto=texto,
        id_categoria=id_categoria,
        solo_activos=solo_activos,
    )


@router.get(
    "/{id_producto}/lotes",
    response_model=list[LoteResponse],
    summary="Listar lotes disponibles de un producto",
)
def listar_lotes_producto(
    id_producto: int = Path(..., gt=0),
) -> list[LoteResponse]:
    return service.listar_lotes(id_producto)


@router.get(
    "/{id_producto}",
    response_model=ProductoResponse,
    summary="Obtener un producto por ID",
)
def obtener_producto(
    id_producto: int = Path(..., gt=0),
) -> ProductoResponse:
    return service.obtener(id_producto)


@router.post(
    "",
    response_model=ProductoCreadoResponse,
    status_code=201,
    summary="Crear producto",
)
def crear_producto(payload: ProductoCreate) -> ProductoCreadoResponse:
    return service.crear(payload)


@router.put(
    "/{id_producto}",
    response_model=MessageResponse,
    summary="Actualizar producto",
)
def actualizar_producto(
    payload: ProductoUpdate,
    id_producto: int = Path(..., gt=0),
) -> MessageResponse:
    return service.actualizar(id_producto, payload)


@router.delete(
    "/{id_producto}",
    response_model=MessageResponse,
    summary="Desactivar producto",
)
def desactivar_producto(
    id_producto: int = Path(..., gt=0),
) -> MessageResponse:
    return service.desactivar(id_producto)
