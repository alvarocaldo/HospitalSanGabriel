"""Servicio de autenticación."""

from app.core.exceptions import AppException
from app.core.security import create_access_token, verify_password
from app.repositories.usuario_repository import UsuarioRepository
from app.schemas.auth import TokenResponse, UsuarioResponse


class AuthService:
    def __init__(self, repository: UsuarioRepository | None = None) -> None:
        self.repository = repository or UsuarioRepository()

    def login(self, username: str, password: str) -> TokenResponse:
        usuario = self.repository.obtener_por_username(username.strip())

        if usuario is None:
            raise AppException(
                401,
                "Usuario o contraseña incorrectos.",
                code="INVALID_CREDENTIALS",
                headers={"WWW-Authenticate": "Bearer"},
            )

        password_valida = verify_password(password, usuario["password_hash"])

        if not password_valida:
            raise AppException(
                401,
                "Usuario o contraseña incorrectos.",
                code="INVALID_CREDENTIALS",
                headers={"WWW-Authenticate": "Bearer"},
            )

        token, expires_in = create_access_token(
            subject=usuario["username"],
            extra_claims={
                "id_usuario": usuario["id_usuario"],
                "nombre_completo": usuario["nombre_completo"],
                "rol": usuario["rol"],
            },
        )

        return TokenResponse(
            access_token=token,
            expires_in=expires_in,
            usuario=UsuarioResponse(
                id_usuario=usuario["id_usuario"],
                username=usuario["username"],
                nombre_completo=usuario["nombre_completo"],
                rol=usuario["rol"],
            ),
        )
