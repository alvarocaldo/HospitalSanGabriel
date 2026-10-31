"""Genera un hash bcrypt para la contraseña indicada.

Uso:
    python generar_hash.py
    python generar_hash.py otra_contraseña

Sin argumentos genera el hash de 'admin123'.
"""

import sys

from app.core.security import get_password_hash


def main() -> None:
    password = sys.argv[1] if len(sys.argv) > 1 else "admin123"
    print(get_password_hash(password))


if __name__ == "__main__":
    main()
