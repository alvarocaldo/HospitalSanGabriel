"""Repositorio base.

Regla estricta de la capa: los repositorios SOLO ejecutan procedimientos
almacenados con la forma ``EXEC dbo.sp_...``. No se escribe SQL directo
(SELECT, INSERT, UPDATE, DELETE).
"""

import re
from typing import Any, Sequence

import pyodbc

from app.core.exceptions import translate_db_error
from app.db.connection import db_cursor, rows_to_dicts

_SP_NAME_RE = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")


class BaseRepository:
    """Métodos auxiliares para invocar procedimientos almacenados."""

    def _exec(
        self,
        sp_name: str,
        params: Sequence[tuple[str, Any]] | None = None,
    ) -> list[dict[str, Any]]:
        """Ejecuta un SP y devuelve la primera tabla de resultados."""
        sql, values = self._build_exec(sp_name, params)

        try:
            with db_cursor() as cursor:
                cursor.execute(sql, *values)

                # Saltar result sets sin columnas (rowcounts) hasta encontrar
                # la primera tabla real devuelta por el procedimiento.
                rows: list[dict[str, Any]] = []
                encontrado = False
                while True:
                    if cursor.description is not None:
                        rows = rows_to_dicts(cursor)
                        encontrado = True
                        break
                    if not cursor.nextset():
                        break

                # Consumir result sets adicionales.
                if encontrado:
                    while cursor.nextset():
                        pass

                return rows
        except pyodbc.Error as exc:
            raise translate_db_error(exc) from exc

    def _exec_one(
        self,
        sp_name: str,
        params: Sequence[tuple[str, Any]] | None = None,
    ) -> dict[str, Any] | None:
        """Ejecuta un SP y devuelve la primera fila o None."""
        rows = self._exec(sp_name, params)
        return rows[0] if rows else None

    def _exec_scalar(
        self,
        sp_name: str,
        params: Sequence[tuple[str, Any]] | None = None,
    ) -> Any | None:
        """Ejecuta un SP y devuelve el primer valor de la primera fila."""
        row = self._exec_one(sp_name, params)
        if row is None:
            return None
        return next(iter(row.values()), None)

    @staticmethod
    def _build_exec(
        sp_name: str,
        params: Sequence[tuple[str, Any]] | None,
    ) -> tuple[str, list[Any]]:
        """Construye la sentencia EXEC con parámetros nombrados."""
        if not sp_name.startswith("sp_") or not _SP_NAME_RE.match(sp_name):
            raise ValueError(f"Nombre de procedimiento almacenado inválido: {sp_name}")

        sql = f"EXEC dbo.{sp_name}"
        if params:
            sql += " " + ", ".join(f"@{name}=?" for name, _ in params)

        values = [value for _, value in params] if params else []
        return sql, values
