"""Configuración central de la aplicación."""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# app/core/config.py -> app/core -> app -> backend
BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """Variables de entorno cargadas desde el archivo .env."""

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Aplicación
    APP_NAME: str = "Hospital San Gabriel - API de Inventario"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    DEBUG: bool = True

    # SQL Server
    DB_SERVER: str
    DB_NAME: str
    DB_USER: str
    DB_PASSWORD: str
    DB_DRIVER: str = "ODBC Driver 17 for SQL Server"
    DB_ENCRYPT: str = "no"
    DB_TRUST_SERVER_CERTIFICATE: str = "yes"
    DB_TIMEOUT: int = 10

    # JWT
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    # CORS
    CORS_ORIGINS: str = "http://localhost:4200,http://127.0.0.1:4200"

    @property
    def cors_origins(self) -> list[str]:
        """Convierte la lista separada por comas en una lista de orígenes."""
        return [origen.strip() for origen in self.CORS_ORIGINS.split(",") if origen.strip()]

    @property
    def db_password_is_placeholder(self) -> bool:
        """Indica si DB_PASSWORD aún tiene un valor de ejemplo."""
        return self.DB_PASSWORD.strip() in {"", "tu_contraseña", "CAMBIA_ESTA_CLAVE"}

    @property
    def database_connection_string(self) -> str:
        """Cadena de conexión ODBC para SQL Server."""
        # ODBC permite delimitar valores con llaves; los '}' internos se
        # duplican. Así la contraseña puede contener ';', '{' o '}'.
        password = "{" + self.DB_PASSWORD.replace("}", "}}") + "}"

        return (
            f"DRIVER={{{self.DB_DRIVER}}};"
            f"SERVER={self.DB_SERVER};"
            f"DATABASE={self.DB_NAME};"
            f"UID={self.DB_USER};"
            f"PWD={password};"
            f"Encrypt={self.DB_ENCRYPT};"
            f"TrustServerCertificate={self.DB_TRUST_SERVER_CERTIFICATE};"
            "APP=HospitalSanGabrielAPI;"
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
