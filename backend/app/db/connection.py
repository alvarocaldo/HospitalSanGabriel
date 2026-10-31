"""Conexión a SQL Server mediante pyodbc."""

import logging
from contextlib import contextmanager
from typing import Any, Iterator

import pyodbc

from app.core.config import settings
from app.core.exceptions import DatabaseException

logger = logging.getLogger(__name__)

# Reutiliza conexiones del pool de ODBC.
pyodbc.pooling = True


def get_db_connection(*, log_errors: bool = True) -> pyodbc.Connection:
    """Abre y devuelve una conexión a SQL Server.

    Se usa autocommit=True porque los procedimientos almacenados de
    entradas y salidas manejan sus propias transacciones.
    """
    if settings.db_password_is_placeholder:
        message = (
            "DB_PASSWORD sigue con el valor de ejemplo. "
            f"Edite el archivo .env y coloque la contraseña real del usuario "
            f"{settings.DB_USER}."
        )
        if log_errors:
            logger.error(message)
        raise DatabaseException(
            503,
            message,
            code="DB_PASSWORD_PLACEHOLDER",
        )

    try:
        connection = pyodbc.connect(
            settings.database_connection_string,
            timeout=settings.DB_TIMEOUT,
            autocommit=True,
        )
        return connection
    except pyodbc.Error as exc:
        if log_errors:
            logger.exception("No se pudo conectar a SQL Server.")

        raw_message = " ".join(str(arg) for arg in exc.args) if exc.args else str(exc)
        if "18456" in raw_message or "28000" in raw_message:
            message = (
                f"SQL Server rechazó el inicio de sesión del usuario "
                f"'{settings.DB_USER}'. Revise DB_PASSWORD en .env. "
                "Si la contraseña es correcta, habilite la autenticación mixta "
                "y restablezca la clave de ese usuario."
            )
            code = "DB_LOGIN_FAILED"
        else:
            message = (
                "No se pudo conectar con la base de datos. "
                "Verifique el servidor y las credenciales."
            )
            code = "DB_CONNECTION_ERROR"

        raise DatabaseException(503, message, code=code) from exc


@contextmanager
def db_cursor() -> Iterator[pyodbc.Cursor]:
    """Context manager que entrega un cursor y cierra cursor/conexión."""
    connection = get_db_connection()
    cursor: pyodbc.Cursor | None = None
    try:
        cursor = connection.cursor()
        yield cursor
    finally:
        if cursor is not None:
            cursor.close()
        connection.close()


def rows_to_dicts(cursor: pyodbc.Cursor) -> list[dict[str, Any]]:
    """Convierte las filas del cursor en una lista de diccionarios."""
    columns = [column[0] for column in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]


def check_connection() -> bool:
    """Comprueba si es posible abrir una conexión a SQL Server."""
    try:
        connection = get_db_connection(log_errors=False)
        connection.close()
        return True
    except Exception:  # noqa: BLE001 - el health check no debe romper la API
        return False
