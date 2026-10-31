"""Servicio de productos."""

from app.core.exceptions import AppException
from app.repositories.producto_repository import ProductoRepository
from app.schemas.common import MessageResponse
from app.schemas.producto import (
    LoteResponse,
    ProductoCreadoResponse,
    ProductoCreate,
    ProductoResponse,
    ProductoUpdate,
)


class ProductoService:
    def __init__(self, repository: ProductoRepository | None = None) -> None:
        self.repository = repository or ProductoRepository()

    def listar(
        self,
        texto: str | None = None,
        id_categoria: int | None = None,
        solo_activos: bool = True,
    ) -> list[ProductoResponse]:
        texto_normalizado = texto.strip() if texto and texto.strip() else None
        rows = self.repository.listar(
            texto=texto_normalizado,
            id_categoria=id_categoria,
            solo_activos=solo_activos,
        )
        return [ProductoResponse.model_validate(row) for row in rows]

    def obtener(self, id_producto: int) -> ProductoResponse:
        row = self.repository.obtener(id_producto)
        if row is None:
            raise AppException(
                404,
                "Producto no encontrado.",
                code="PRODUCTO_NO_ENCONTRADO",
            )
        return ProductoResponse.model_validate(row)

    def listar_lotes(self, id_producto: int) -> list[LoteResponse]:
        return [
            LoteResponse.model_validate(row)
            for row in self.repository.listar_lotes(id_producto)
        ]

    def crear(self, payload: ProductoCreate) -> ProductoCreadoResponse:
        id_producto = self.repository.crear(
            codigo=payload.codigo,
            nombre=payload.nombre,
            descripcion=payload.descripcion,
            id_categoria=payload.id_categoria,
            unidad_medida=payload.unidad_medida,
            precio_unitario=payload.precio_unitario,
            stock_minimo=payload.stock_minimo,
            maneja_lote=payload.maneja_lote,
            fecha_vencimiento=payload.fecha_vencimiento,
        )
        if id_producto is None:
            raise AppException(
                500,
                "No se pudo crear el producto.",
                code="PRODUCTO_NO_CREADO",
            )
        return ProductoCreadoResponse(id_producto=int(id_producto))

    def actualizar(
        self,
        id_producto: int,
        payload: ProductoUpdate,
    ) -> MessageResponse:
        self.repository.actualizar(
            id_producto=id_producto,
            codigo=payload.codigo,
            nombre=payload.nombre,
            descripcion=payload.descripcion,
            id_categoria=payload.id_categoria,
            unidad_medida=payload.unidad_medida,
            precio_unitario=payload.precio_unitario,
            stock_minimo=payload.stock_minimo,
            maneja_lote=payload.maneja_lote,
            fecha_vencimiento=payload.fecha_vencimiento,
        )
        return MessageResponse(message="Producto actualizado correctamente.")

    def desactivar(self, id_producto: int) -> MessageResponse:
        self.repository.desactivar(id_producto)
        return MessageResponse(message="Producto desactivado correctamente.")
