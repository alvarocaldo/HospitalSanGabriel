"""Rutas de categorías."""

from fastapi import APIRouter, Depends, Path

from app.api.deps import get_current_user
from app.schemas.categoria import (
    CategoriaCreate,
    CategoriaCreadaResponse,
    CategoriaResponse,
    CategoriaUpdate,
)
from app.schemas.common import MessageResponse
from app.services.categoria_service import CategoriaService

router = APIRouter(
    prefix="/categorias",
    tags=["Categorías"],
    dependencies=[Depends(get_current_user)],
)
service = CategoriaService()


@router.get(
    "",
    response_model=list[CategoriaResponse],
    summary="Listar categorías activas",
)
def listar_categorias() -> list[CategoriaResponse]:
    return service.listar()


@router.post(
    "",
    response_model=CategoriaCreadaResponse,
    status_code=201,
    summary="Crear categoría",
)
def crear_categoria(payload: CategoriaCreate) -> CategoriaCreadaResponse:
    return service.crear(payload)


@router.put(
    "/{id_categoria}",
    response_model=MessageResponse,
    summary="Actualizar categoría",
)
def actualizar_categoria(
    payload: CategoriaUpdate,
    id_categoria: int = Path(..., gt=0, description="ID de la categoría"),
) -> MessageResponse:
    return service.actualizar(id_categoria, payload)
