"""Repositorio de áreas hospitalarias."""

from typing import Any

from app.repositories.base_repository import BaseRepository


class AreaRepository(BaseRepository):
    def listar(self) -> list[dict[str, Any]]:
        return self._exec("sp_area_listar")
