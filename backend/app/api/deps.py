"""Dependencias de autenticación y autorización."""

from collections.abc import Callable

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError

from app.core.config import settings
from app.core.exceptions import AppException
from app.core.security import decode_access_token
from app.schemas.auth import CurrentUser

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_PREFIX}/auth/token",
)


def get_current_user(token: str = Depends(oauth2_scheme)) -> CurrentUser:
    """Valida el JWT y devuelve los datos del usuario autenticado."""
    try:
        payload = decode_access_token(token)
    except JWTError as exc:
        raise AppException(
            401,
            "Token inválido o expirado.",
            code="INVALID_TOKEN",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    id_usuario = payload.get("id_usuario")
    username = payload.get("sub")

    if id_usuario is None or not username:
        raise AppException(
            401,
            "Token inválido.",
            code="INVALID_TOKEN",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        id_usuario_int = int(id_usuario)
    except (TypeError, ValueError) as exc:
        raise AppException(
            401,
            "Token inválido.",
            code="INVALID_TOKEN",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    return CurrentUser(
        id_usuario=id_usuario_int,
        username=str(username),
        nombre_completo=str(payload.get("nombre_completo") or username),
        rol=str(payload.get("rol") or "USUARIO"),
    )


def require_roles(*roles: str) -> Callable[..., CurrentUser]:
    """Genera una dependencia que exige uno de los roles indicados."""
    roles_normalizados = {rol.upper() for rol in roles}

    def dependency(
        current_user: CurrentUser = Depends(get_current_user),
    ) -> CurrentUser:
        if current_user.rol.upper() not in roles_normalizados:
            raise AppException(
                403,
                "No tiene permisos para realizar esta acción.",
                code="FORBIDDEN",
            )
        return current_user

    return dependency
