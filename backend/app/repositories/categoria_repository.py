"""Repositorio de categorías."""

from typing import Any

from app.repositories.base_repository import BaseRepository


class CategoriaRepository(BaseRepository):
    def listar(self) -> list[dict[str, Any]]:
        return self._exec("sp_categoria_listar")

    def crear(self, nombre: str, descripcion: str | None) -> Any | None:
        return self._exec_scalar(
            "sp_categoria_crear",
            [
                ("nombre", nombre),
                ("descripcion", descripcion),
            ],
        )

    def actualizar(
        self,
        id_categoria: int,
        nombre: str,
        descripcion: str | None,
    ) -> None:
        self._exec(
            "sp_categoria_actualizar",
            [
                ("id_categoria", id_categoria),
                ("nombre", nombre),
                ("descripcion", descripcion),
            ],
        )
