"""Esquemas de autenticación."""

from pydantic import BaseModel, Field, field_validator


class LoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=50, examples=["admin"])
    password: str = Field(min_length=1, max_length=128, examples=["admin123"])

    @field_validator("username")
    @classmethod
    def normalizar_username(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("El nombre de usuario es obligatorio.")
        return value


class UsuarioResponse(BaseModel):
    id_usuario: int
    username: str
    nombre_completo: str
    rol: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    usuario: UsuarioResponse


class CurrentUser(BaseModel):
    id_usuario: int
    username: str
    nombre_completo: str
    rol: str
