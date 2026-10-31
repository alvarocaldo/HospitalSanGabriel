"""Rutas de autenticación."""

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

from app.api.deps import get_current_user
from app.schemas.auth import CurrentUser, LoginRequest, TokenResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Autenticación"])
service = AuthService()


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Iniciar sesión (JSON)",
    description="Recibe usuario y contraseña en formato JSON y devuelve un token JWT.",
)
def login(payload: LoginRequest) -> TokenResponse:
    return service.login(payload.username, payload.password)


@router.post(
    "/token",
    response_model=TokenResponse,
    summary="Iniciar sesión (OAuth2 / Swagger)",
    description="Endpoint de formulario usado por el botón Authorize de Swagger.",
)
def login_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> TokenResponse:
    return service.login(form_data.username, form_data.password)


@router.get(
    "/me",
    response_model=CurrentUser,
    summary="Datos del usuario autenticado",
)
def me(current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    return current_user
