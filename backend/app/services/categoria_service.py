"""Servicio de categorías."""

from app.core.exceptions import AppException
from app.repositories.categoria_repository import CategoriaRepository
from app.schemas.categoria import (
    CategoriaCreate,
    CategoriaCreadaResponse,
    CategoriaResponse,
    CategoriaUpdate,
)
from app.schemas.common import MessageResponse


class CategoriaService:
    def __init__(self, repository: CategoriaRepository | None = None) -> None:
        self.repository = repository or CategoriaRepository()

    def listar(self) -> list[CategoriaResponse]:
        return [
            CategoriaResponse.model_validate(row)
            for row in self.repository.listar()
        ]

    def crear(self, payload: CategoriaCreate) -> CategoriaCreadaResponse:
        id_categoria = self.repository.crear(
            nombre=payload.nombre,
            descripcion=payload.descripcion,
        )
        if id_categoria is None:
            raise AppException(
                500,
                "No se pudo crear la categoría.",
                code="CATEGORIA_NO_CREADA",
            )
        return CategoriaCreadaResponse(id_categoria=int(id_categoria))

    def actualizar(
        self,
        id_categoria: int,
        payload: CategoriaUpdate,
    ) -> MessageResponse:
        self.repository.actualizar(
            id_categoria=id_categoria,
            nombre=payload.nombre,
            descripcion=payload.descripcion,
        )
        return MessageResponse(message="Categoría actualizada correctamente.")
