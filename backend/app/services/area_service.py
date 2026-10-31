"""Servicio de áreas hospitalarias."""

from app.repositories.area_repository import AreaRepository
from app.schemas.area import AreaResponse


class AreaService:
    def __init__(self, repository: AreaRepository | None = None) -> None:
        self.repository = repository or AreaRepository()

    def listar(self) -> list[AreaResponse]:
        return [
            AreaResponse.model_validate(row)
            for row in self.repository.listar()
        ]
