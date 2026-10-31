"""Funciones de seguridad: hash de contraseñas y tokens JWT."""

from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
from jose import jwt

from app.core.config import settings


def get_password_hash(password: str) -> str:
    """Genera el hash bcrypt de una contraseña."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica una contraseña contra su hash bcrypt."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception:  # noqa: BLE001 - un hash inválido no debe romper el login
        return False


def create_access_token(
    subject: str,
    extra_claims: dict[str, Any] | None = None,
) -> tuple[str, int]:
    """Crea un JWT y devuelve (token, segundos_de_vigencia)."""
    expires_in = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    now = datetime.now(timezone.utc)

    payload: dict[str, Any] = {
        "sub": subject,
        "iat": now,
        "exp": now + timedelta(seconds=expires_in),
    }
    if extra_claims:
        payload.update(extra_claims)

    token = jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )
    return token, expires_in


def decode_access_token(token: str) -> dict[str, Any]:
    """Decodifica y valida un JWT. Lanza JWTError si es inválido o expiró."""
    return jwt.decode(
        token,
        settings.JWT_SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
    )
