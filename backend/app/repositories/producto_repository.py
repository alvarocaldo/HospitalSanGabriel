"""Repositorio de productos."""

from datetime import date
from decimal import Decimal
from typing import Any

from app.repositories.base_repository import BaseRepository


class ProductoRepository(BaseRepository):
    def listar(
        self,
        texto: str | None = None,
        id_categoria: int | None = None,
        solo_activos: bool = True,
    ) -> list[dict[str, Any]]:
        return self._exec(
            "sp_producto_listar",
            [
                ("texto", texto),
                ("id_categoria", id_categoria),
                ("solo_activos", solo_activos),
            ],
        )

    def obtener(self, id_producto: int) -> dict[str, Any] | None:
        return self._exec_one(
            "sp_producto_obtener",
            [("id_producto", id_producto)],
        )

    def listar_lotes(self, id_producto: int) -> list[dict[str, Any]]:
        return self._exec(
            "sp_lote_listar_por_producto",
            [("id_producto", id_producto)],
        )

    def crear(
        self,
        *,
        codigo: str,
        nombre: str,
        descripcion: str | None,
        id_categoria: int,
        unidad_medida: str,
        precio_unitario: Decimal,
        stock_minimo: int,
        maneja_lote: bool,
        fecha_vencimiento: date | None,
    ) -> Any | None:
        return self._exec_scalar(
            "sp_producto_crear",
            [
                ("codigo", codigo),
                ("nombre", nombre),
                ("descripcion", descripcion),
                ("id_categoria", id_categoria),
                ("unidad_medida", unidad_medida),
                ("precio_unitario", precio_unitario),
                ("stock_minimo", stock_minimo),
                ("maneja_lote", maneja_lote),
                ("fecha_vencimiento", fecha_vencimiento),
            ],
        )

    def actualizar(
        self,
        *,
        id_producto: int,
        codigo: str,
        nombre: str,
        descripcion: str | None,
        id_categoria: int,
        unidad_medida: str,
        precio_unitario: Decimal,
        stock_minimo: int,
        maneja_lote: bool,
        fecha_vencimiento: date | None,
    ) -> None:
        self._exec(
            "sp_producto_actualizar",
            [
                ("id_producto", id_producto),
                ("codigo", codigo),
                ("nombre", nombre),
                ("descripcion", descripcion),
                ("id_categoria", id_categoria),
                ("unidad_medida", unidad_medida),
                ("precio_unitario", precio_unitario),
                ("stock_minimo", stock_minimo),
                ("maneja_lote", maneja_lote),
                ("fecha_vencimiento", fecha_vencimiento),
            ],
        )

    def desactivar(self, id_producto: int) -> None:
        self._exec(
            "sp_producto_desactivar",
            [("id_producto", id_producto)],
        )
