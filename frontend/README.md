# Hospital San Gabriel · Sistema de Inventario (Frontend)

Aplicación web de gestión de inventario hospitalario construida con **Angular 22** (componentes
standalone), **Signal Forms** y **Tailwind CSS v4**. Consume la API REST del backend FastAPI del
Hospital San Gabriel.

## Características

- Inicio de sesión con JWT, interceptor `Authorization: Bearer` y guard de rutas protegidas.
- Dashboard con indicadores de inventario, alertas y accesos rápidos.
- Catálogo de productos: listado con búsqueda y filtros, alta, edición y desactivación lógica.
- Categorías: listado y formulario de creación/edición en la misma vista.
- Registro de entradas de stock con control condicional de lote y fecha de vencimiento.
- Registro de salidas hacia áreas hospitalarias, con selección opcional de lote y FEFO automático.
- Historial de movimientos con filtros por tipo, producto y rango de fechas.
- Alertas de stock bajo y de vencimientos (próximos y vencidos).
- Reporte de productos con mayores salidas, con exportación a CSV.
- Diseño responsive y premium basado exclusivamente en Tailwind CSS.
- Todos los formularios usan **Angular Signal Forms** con mensajes de validación visibles en rojo.

## Requisitos

- Node.js `^22.22.3`, `^24.15.0` o `>=26` (requisito de Angular 22) y npm.
- Backend del Hospital San Gabriel en ejecución (`http://127.0.0.1:8000`).
- Base de datos SQL Server configurada por el backend.

## Instalación y ejecución

```bash
cd frontend
npm install
npm start
```

La aplicación queda disponible en `http://localhost:4200/`.

> El backend debe permitir CORS para `http://localhost:4200` y `http://127.0.0.1:4200`.
> Esta configuración ya está prevista en el backend del proyecto.

### Acceso de prueba

| Usuario | Contraseña |
| ------- | ---------- |
| `admin` | `admin123`  |

## Configuración de la API

La URL base se define en `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://127.0.0.1:8000/api',
};
```

Si el backend se ejecuta en otro host o puerto, actualice `apiUrl`. Todas las peticiones protegidas
adjuntan automáticamente el token JWT almacenado en `localStorage`.

## Rutas principales

| Ruta                    | Descripción                                      |
| ----------------------- | ------------------------------------------------ |
| `/login`                | Inicio de sesión                                 |
| `/dashboard`            | Panel general con indicadores y alertas          |
| `/productos`            | Catálogo de productos                            |
| `/productos/nuevo`      | Alta de producto                                 |
| `/productos/:id/editar` | Edición de producto                              |
| `/categorias`           | Listado y formulario de categorías               |
| `/entradas/nueva`       | Registro de entrada de stock                     |
| `/salidas/nueva`        | Registro de salida de stock                      |
| `/movimientos`          | Historial de movimientos                         |
| `/alertas/stock-bajo`   | Productos en nivel crítico                       |
| `/alertas/vencimientos` | Próximos vencimientos y productos vencidos       |
| `/reportes/salidas`     | Productos con mayores salidas y exportación CSV  |

Todas las rutas, excepto `/login`, están protegidas por `authGuard`.

## Estructura del proyecto

```
src/
├── app/
│   ├── core/
│   │   ├── guards/          # authGuard
│   │   ├── interceptors/    # Inyección del token JWT
│   │   ├── models/          # Interfaces alineadas con el backend
│   │   ├── services/        # Acceso a la API REST
│   │   └── utils/           # Manejo de errores HTTP
│   ├── layout/
│   │   └── main-layout/     # Sidebar, header y contenedor protegido
│   ├── pages/
│   │   ├── alertas/         # Stock bajo y vencimientos
│   │   ├── categorias/      # Listado y formulario de categorías
│   │   ├── dashboard/       # Indicadores
│   │   ├── login/           # Autenticación
│   │   ├── movimientos/     # Entradas, salidas e historial
│   │   ├── productos/       # Catálogo y formulario
│   │   └── reportes/        # Reporte de salidas
│   ├── shared/
│   │   ├── field-error/     # Mensajes de validación reutilizables
│   │   └── icon/            # Iconos SVG inline
│   ├── app.config.ts
│   ├── app.routes.ts
│   └── app.ts
├── environments/
│   └── environment.ts
├── styles.css               # Tailwind y clases de componentes
└── main.ts
```

## Formularios con Signal Forms

Los formularios se definen con `form(model, schema, options)` y se enlazan en la plantilla mediante
`[formRoot]` y `[formField]`. Las validaciones utilizan `required`, `min`, `max`, `minLength`,
`maxLength` y `validate`, mostrando los errores con el componente `app-field-error`.

Ejemplo simplificado:

```ts
readonly productoForm = form(
  this.modelo,
  (path) => {
    required(path.nombre, { message: 'El nombre es obligatorio.' });
    min(path.precio_unitario, 0.01, { message: 'El precio debe ser mayor que 0.' });
  },
  {
    submission: {
      action: async () => {
        /* guardar */
      },
    },
  },
);
```

## Tailwind CSS v4

El proyecto usa Tailwind CSS v4 mediante PostCSS, sin archivo `tailwind.config.js`:

- `tailwindcss` y `@tailwindcss/postcss` en `devDependencies`.
- `.postcssrc.json` registra el plugin.
- `src/styles.css` importa Tailwind con `@import "tailwindcss";` y define las clases reutilizables
  `.card`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-ghost`, `.field-label`,
  `.field-input`, `.field-error`, `.badge`, `.table-th` y `.table-td`.

> En Tailwind v4 el modificador `!important` se escribe como sufijo, por ejemplo `px-3!`.

## Scripts disponibles

| Comando         | Descripción                                      |
| --------------- | ------------------------------------------------ |
| `npm start`     | Servidor de desarrollo en `http://localhost:4200` |
| `npm run build` | Compilación de producción en `dist/`             |
| `npm run watch` | Compilación en modo desarrollo con recarga       |
| `npm test`      | Ejecución de pruebas unitarias con Vitest        |

## Solución de problemas

- **Error 401 o redirección constante al login:** verifique que el backend esté activo y que el
  token no haya expirado. Cierre sesión y vuelva a ingresar.
- **Error de conexión (`status 0`):** confirme que la API responde en la URL configurada y que CORS
  permite el origen de Angular.
- **Estilos sin aplicar:** asegúrese de haber ejecutado `npm install` para instalar
  `tailwindcss` y `@tailwindcss/postcss`.
- **Pantalla en blanco tras un cambio:** revise la consola del navegador y reinicie `npm start`.
