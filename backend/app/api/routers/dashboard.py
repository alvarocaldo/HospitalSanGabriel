"""Rutas del dashboard e indicadores."""

from datetime import date

from fastapi import APIRouter, Depends, Query

from app.api.deps import get_current_user
from app.schemas.dashboard import (
    DashboardIndicadores,
    ProductoMayorSalida,
    ProductoPorVencer,
    ProductoStockBajo,
    ProductoVencido,
)
from app.services.dashboard_service import DashboardService

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
    dependencies=[Depends(get_current_user)],
)
service = DashboardService()


@router.get(
    "/indicadores",
    response_model=DashboardIndicadores,
    summary="Indicadores generales del inventario",
)
def obtener_indicadores() -> DashboardIndicadores:
    return service.indicadores()


@router.get(
    "/mayores-salidas",
    response_model=list[ProductoMayorSalida],
    summary="Productos con mayores salidas en un rango de fechas",
)
def obtener_mayores_salidas(
    fecha_desde: date | None = Query(
        default=None,
        description="Por defecto: hace 30 días",
    ),
    fecha_hasta: date | None = Query(
        default=None,
        description="Por defecto: hoy",
    ),
    top_n: int = Query(default=10, ge=1, le=100),
) -> list[ProductoMayorSalida]:
    return service.mayores_salidas(
        fecha_desde=fecha_desde,
        fecha_hasta=fecha_hasta,
        top_n=top_n,
    )


@router.get(
    "/alertas/stock-bajo",
    response_model=list[ProductoStockBajo],
    summary="Productos con stock igual o inferior al mínimo",
)
def obtener_stock_bajo() -> list[ProductoStockBajo]:
    return service.stock_bajo()


@router.get(
    "/alertas/proximos-vencer",
    response_model=list[ProductoPorVencer],
    summary="Productos y lotes próximos a vencer",
)
def obtener_proximos_vencer(
    dias: int = Query(default=30, ge=1, le=365),
) -> list[ProductoPorVencer]:
    return service.proximos_vencer(dias)


@router.get(
    "/alertas/vencidos",
    response_model=list[ProductoVencido],
    summary="Productos y lotes vencidos",
)
def obtener_vencidos() -> list[ProductoVencido]:
    return service.vencidos()
