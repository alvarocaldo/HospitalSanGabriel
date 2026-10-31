"""Repositorio de usuarios."""

from typing import Any

from app.repositories.base_repository import BaseRepository


class UsuarioRepository(BaseRepository):
    def obtener_por_username(self, username: str) -> dict[str, Any] | None:
        return self._exec_one(
            "sp_usuario_login",
            [("username", username)],
        )
