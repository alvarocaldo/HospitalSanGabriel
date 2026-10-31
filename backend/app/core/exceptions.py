"""Excepciones de la aplicación y traducción de errores de SQL Server."""

import logging
import re

import pyodbc

logger = logging.getLogger(__name__)


class AppException(Exception):
    """Excepción controlada que se traduce a una respuesta HTTP."""

    def __init__(
        self,
        status_code: int,
        message: str,
        *,
        code: str | None = None,
        headers: dict[str, str] | None = None,
    ) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.message = message
        self.code = code
        self.headers = headers


class DatabaseException(AppException):
    """Error originado en la base de datos."""


# Códigos de error lanzados con THROW en los procedimientos almacenados
# y errores nativos de SQL Server.
_STATUS_BY_SQL_ERROR: dict[int, int] = {
    50002: 404,  # Producto no encontrado
    50003: 400,  # Stock insuficiente
    50004: 400,  # Producto/lote vencido
    50005: 400,  # Falta número de lote
    50006: 400,  # Lote no válido / sin stock
    50007: 400,  # Área no válida
    50008: 400,  # Cantidad inválida
    50010: 400,  # Nombre de categoría obligatorio
    50011: 409,  # Categoría duplicada
    50012: 404,  # Categoría no encontrada
    50013: 400,  # Código obligatorio
    50014: 400,  # Nombre obligatorio
    50015: 400,  # Precio inválido
    50016: 400,  # Stock mínimo inválido
    50017: 409,  # Código de producto duplicado
    50018: 400,  # Motivo obligatorio
    2601: 409,   # Índice único duplicado
    2627: 409,   # Restricción UNIQUE / PRIMARY KEY
    547: 400,    # Restricción FOREIGN KEY
    515: 400,    # Columna NOT NULL
    245: 400,    # Conversión de tipo
    8114: 400,   # Error de conversión
    8152: 400,   # Cadena truncada
}

_SQL_ERROR_NUMBER_RE = re.compile(r"\((\d{4,6})\)")
_SQL_TRAILING_ERROR_RE = re.compile(r"\s*\(\d{4,6}\)(?:\s*\([^)]*\))?\s*$")


def _extract_error_number(raw_message: str) -> int | None:
    matches = _SQL_ERROR_NUMBER_RE.findall(raw_message)
    if not matches:
        return None
    return int(matches[-1])


def _clean_error_message(raw_message: str) -> str:
    message = raw_message
    if "] " in message:
        message = message.rsplit("] ", 1)[-1]
    message = _SQL_TRAILING_ERROR_RE.sub("", message).strip()
    return message or "Error al ejecutar la operación en la base de datos."


def translate_db_error(exc: pyodbc.Error) -> DatabaseException:
    """Convierte un pyodbc.Error en una DatabaseException con código HTTP."""
    raw_message = " ".join(str(arg) for arg in exc.args) if exc.args else str(exc)
    error_number = _extract_error_number(raw_message)
    message = _clean_error_message(raw_message)

    status_code = _STATUS_BY_SQL_ERROR.get(error_number or 0)
    if status_code is None:
        # Los THROW personalizados usan el rango 50000-59999.
        if error_number is not None and 50000 <= error_number < 60000:
            status_code = 400
        else:
            status_code = 500

    logger.error("Error de SQL Server [%s]: %s", error_number, raw_message)

    return DatabaseException(
        status_code,
        message,
        code=f"DB_{error_number}" if error_number is not None else "DB_ERROR",
    )
