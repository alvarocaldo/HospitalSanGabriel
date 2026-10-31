# Hospital San Gabriel - Backend de Inventario

API REST en **FastAPI + SQL Server (pyodbc)** para la gestión de inventario
hospitalario. Organizada por capas:

```
routers (HTTP) -> services (lógica) -> repositories (EXEC sp_...) -> SQL Server
```

## Estructura

```
backend/
├── .env                        # Credenciales reales (no versionar)
├── .env.example                # Plantilla de variables
├── requirements.txt
├── run.py                      # Ejecuta uvicorn en desarrollo
├── SQLQuery1.sql               # Esquema de la base de datos
├── SQLQuery2.sql               # Procedimientos almacenados
├── SQLQuery3.sql               # Datos iniciales
└── app/
    ├── main.py                 # FastAPI, CORS, exception handlers, routers
    ├── api/
    │   ├── deps.py             # JWT: get_current_user / require_roles
    │   └── routers/
    │       ├── auth.py
    │       ├── categorias.py
    │       ├── productos.py
    │       ├── entradas.py
    │       ├── salidas.py
    │       ├── movimientos.py
    │       ├── dashboard.py
    │       └── areas.py
    ├── core/
    │   ├── config.py           # pydantic-settings (.env)
    │   ├── security.py         # bcrypt + JWT
    │   ├── exceptions.py       # AppException + traducción de errores SQL
    │   └── utils.py            # inicio/fin de día
    ├── db/
    │   └── connection.py       # get_db_connection(), db_cursor()
    ├── repositories/
    │   ├── base_repository.py  # solo EXEC dbo.sp_...
    │   ├── usuario_repository.py
    │   ├── categoria_repository.py
    │   ├── producto_repository.py
    │   ├── entrada_repository.py
    │   ├── salida_repository.py
    │   ├── movimiento_repository.py
    │   ├── dashboard_repository.py
    │   └── area_repository.py
    ├── schemas/                # Modelos Pydantic
    └── services/               # Lógica de negocio
```

## Requisitos

- Python 3.10+
- SQL Server con la base `HospitalSanGabriel` creada
- **ODBC Driver 17 for SQL Server** instalado en Windows
- Los scripts `SQLQuery1.sql`, `SQLQuery2.sql` y `SQLQuery3.sql` ejecutados

## Instalación

```powershell
cd D:\HospitalSanGabriel\backend

python -m venv .venv
.\.venv\Scripts\Activate.ps1

pip install -r requirements.txt
```

## Configuración

Edita `.env` y coloca la contraseña real de `sa`:

```env
DB_SERVER=DESKTOP-22GAT46\SQLEXPRESS
DB_NAME=HospitalSanGabriel
DB_USER=sa
DB_PASSWORD=tu_contraseña
DB_DRIVER=ODBC Driver 17 for SQL Server
```

También cambia `JWT_SECRET_KEY` por una clave propia y larga.

### Generar el hash del usuario admin

`SQLQuery3.sql` inserta el usuario `admin` con un hash válido para `admin123`.
Para generar uno nuevo (por ejemplo, en producción):

```powershell
python generar_hash.py
```

El script imprime únicamente el hash. También puedes pasar otra contraseña:
`python generar_hash.py mi_clave`.

Luego actualiza la base:

```sql
USE HospitalSanGabriel;
UPDATE dbo.Usuario
SET password_hash = '<HASH_GENERADO>'
WHERE username = 'admin';
```

## Ejecutar

```powershell
python run.py
```

o:

```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- API: http://127.0.0.1:8000
- Swagger: http://127.0.0.1:8000/docs
- Health: http://127.0.0.1:8000/health

## Endpoints

Todos los endpoints (excepto login, `/` y `/health`) requieren:

```
Authorization: Bearer <access_token>
```

### Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Login JSON (`username`, `password`) |
| POST | `/api/auth/token` | Login formulario OAuth2 (Swagger) |
| GET | `/api/auth/me` | Usuario del token |

### Categorías

| Método | Ruta | SP |
|--------|------|----|
| GET | `/api/categorias` | `sp_categoria_listar` |
| POST | `/api/categorias` | `sp_categoria_crear` |
| PUT | `/api/categorias/{id_categoria}` | `sp_categoria_actualizar` |

### Productos

| Método | Ruta | SP |
|--------|------|----|
| GET | `/api/productos?texto=&id_categoria=&solo_activos=` | `sp_producto_listar` |
| GET | `/api/productos/{id_producto}` | `sp_producto_obtener` |
| GET | `/api/productos/{id_producto}/lotes` | `sp_lote_listar_por_producto` |
| POST | `/api/productos` | `sp_producto_crear` |
| PUT | `/api/productos/{id_producto}` | `sp_producto_actualizar` |
| DELETE | `/api/productos/{id_producto}` | `sp_producto_desactivar` |

### Entradas y salidas

| Método | Ruta | SP |
|--------|------|----|
| POST | `/api/entradas` | `sp_entrada_registrar` |
| POST | `/api/salidas` | `sp_salida_registrar` |

El `id_usuario` se toma del token JWT, no del cuerpo de la petición.

Ejemplo de entrada:

```json
{
  "id_producto": 1,
  "cantidad": 50,
  "motivo": "Compra de medicamentos",
  "numero_lote": "LOTE-2026-01",
  "fecha_vencimiento": "2027-12-31"
}
```

Ejemplo de salida:

```json
{
  "id_producto": 1,
  "cantidad": 10,
  "motivo": "Entrega a Emergencia",
  "id_area": 1,
  "id_lote": null
}
```

### Movimientos

| Método | Ruta | SP |
|--------|------|----|
| GET | `/api/movimientos?id_producto=&tipo=&id_area=&fecha_desde=&fecha_hasta=` | `sp_movimiento_listar` |

### Dashboard

| Método | Ruta | SP |
|--------|------|----|
| GET | `/api/dashboard/indicadores` | `sp_dashboard_indicadores` |
| GET | `/api/dashboard/mayores-salidas?fecha_desde=&fecha_hasta=&top_n=` | `sp_productos_mayores_salidas` |
| GET | `/api/dashboard/alertas/stock-bajo` | `sp_producto_stock_bajo` |
| GET | `/api/dashboard/alertas/proximos-vencer?dias=30` | `sp_producto_proximos_vencer` |
| GET | `/api/dashboard/alertas/vencidos` | `sp_producto_vencidos` |

### Áreas hospitalarias

| Método | Ruta | SP |
|--------|------|----|
| GET | `/api/areas` | `sp_area_listar` |

> `areas`, `productos/{id}`, `lotes` y las alertas usan procedimientos que ya
> están definidos en `SQLQuery2.sql`; son de apoyo para el frontend.

## Reglas de arquitectura

- **Repositories**: solo `EXEC dbo.sp_...` con parámetros nombrados. Cero SQL
  directo. `BaseRepository` valida que el nombre empiece por `sp_`.
- **Services**: validaciones y lógica; reciben y devuelven esquemas Pydantic.
- **Routers**: solo HTTP, dependencias y llamadas a services.
- **Errores SQL**: los `THROW` de los SP se traducen a códigos HTTP
  (`404`, `409`, `400`, etc.) en `app/core/exceptions.py`.
- **Conexión**: `autocommit=True`, porque los SP de entradas/salidas manejan
  sus propias transacciones.

## CORS

Configurado para Angular en `http://localhost:4200` y
`http://127.0.0.1:4200`. Se puede ampliar con `CORS_ORIGINS` (separado por
comas) en `.env`.

## Solución de problemas

- **`Data source name not found`**: instala *ODBC Driver 17 for SQL Server*.
- **`Login failed for user 'sa'`**: revisa `DB_PASSWORD` y que la autenticación
  mixta de SQL Server esté habilitada. Si no sabes la clave de `sa`, conéctate
  a SSMS con autenticación de Windows y ejecuta:

  ```sql
  ALTER LOGIN sa WITH PASSWORD = 'NuevaClaveSegura';
  ALTER LOGIN sa ENABLE;
  ```

  Luego habilita *SQL Server and Windows Authentication mode* en las
  propiedades del servidor, reinicia el servicio `SQL Server (SQLEXPRESS)` y
  actualiza `DB_PASSWORD` en `.env`.

  > Si tienes una variable de entorno `DB_PASSWORD` definida en la terminal,
  > tiene prioridad sobre el archivo `.env`. Elimínala o actualízala también.
- **`No se pudo conectar`**: confirma el nombre `DESKTOP-22GAT46\SQLEXPRESS` y
  que el servicio SQL Server esté iniciado. Si la instancia usa puerto
  dinámico, habilita *SQL Server Browser* o usa `SERVER=host,puerto`.
- **Error 401 al login**: genera y actualiza el hash bcrypt del usuario admin.
