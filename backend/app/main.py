"""Aplicación FastAPI del sistema de inventario hospitalario."""

import logging
from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routers import (
    areas,
    auth,
    categorias,
    dashboard,
    entradas,
    movimientos,
    productos,
    salidas,
)
from app.core.config import settings
from app.core.exceptions import AppException
from app.db.connection import check_connection, get_db_connection
from app.schemas.common import HealthResponse

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    logger.info(
        "SQL Server configurado: servidor=%s, base=%s, usuario=%s",
        settings.DB_SERVER,
        settings.DB_NAME,
        settings.DB_USER,
    )
    if settings.db_password_is_placeholder:
        logger.warning(
            "DB_PASSWORD sigue con el valor de ejemplo. "
            f"Edite .env y coloque la contraseña real del usuario {settings.DB_USER}."
        )
    else:
        try:
            connection = get_db_connection(log_errors=False)
            connection.close()
            logger.info("Conexión a SQL Server establecida correctamente.")
        except AppException as exc:
            logger.warning("No se pudo conectar a SQL Server al iniciar: %s", exc.message)
        except Exception:  # noqa: BLE001 - no debe impedir el arranque de la API
            logger.exception("Error inesperado al comprobar la conexión a SQL Server.")
    yield
    logger.info("API detenida.")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "API REST para la gestión de inventario del Hospital San Gabriel. "
        "Arquitectura por capas: routers -> services -> repositories -> SQL Server."
    ),
    lifespan=lifespan,
)

# CORS para el frontend Angular en localhost:4200
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AppException)
async def app_exception_handler(
    request: Request,
    exc: AppException,
) -> JSONResponse:
    content: dict[str, str] = {"detail": exc.message}
    if exc.code:
        content["code"] = exc.code

    return JSONResponse(
        status_code=exc.status_code,
        content=content,
        headers=exc.headers,
    )


# Routers de la API
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(categorias.router, prefix=settings.API_PREFIX)
app.include_router(productos.router, prefix=settings.API_PREFIX)
app.include_router(entradas.router, prefix=settings.API_PREFIX)
app.include_router(salidas.router, prefix=settings.API_PREFIX)
app.include_router(movimientos.router, prefix=settings.API_PREFIX)
app.include_router(dashboard.router, prefix=settings.API_PREFIX)
app.include_router(areas.router, prefix=settings.API_PREFIX)


@app.get("/", tags=["Root"], summary="Información de la API")
def root() -> dict[str, str]:
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "api": settings.API_PREFIX,
    }


@app.get(
    "/health",
    response_model=HealthResponse,
    tags=["Health"],
    summary="Estado de la API y la base de datos",
)
def health() -> HealthResponse:
    db_ok = check_connection()
    return HealthResponse(
        status="ok" if db_ok else "degraded",
        database="connected" if db_ok else "disconnected",
    )
