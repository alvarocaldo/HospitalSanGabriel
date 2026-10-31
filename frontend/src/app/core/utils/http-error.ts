import { HttpErrorResponse } from '@angular/common/http';

interface ApiErrorDetail {
  msg?: string;
  message?: string;
}

interface ApiErrorBody {
  detail?: string | ApiErrorDetail[];
  message?: string;
  code?: string;
}

/**
 * Obtiene un mensaje legible a partir de cualquier error HTTP de la API.
 * FastAPI puede devolver `detail` como string o como una lista de errores 422.
 */
export function obtenerMensajeError(error: unknown, fallback = 'Ocurrió un error inesperado.'): string {
  if (error instanceof HttpErrorResponse) {
    const body = error.error as ApiErrorBody | string | null;

    if (typeof body === 'string' && body.trim()) {
      return body;
    }

    if (body && typeof body === 'object') {
      if (typeof body.detail === 'string' && body.detail.trim()) {
        return body.detail;
      }

      if (Array.isArray(body.detail) && body.detail.length > 0) {
        const mensajes = body.detail
          .map((item) => item.msg ?? item.message)
          .filter((msg): msg is string => Boolean(msg));
        if (mensajes.length > 0) {
          return mensajes.join(' ');
        }
      }

      if (typeof body.message === 'string' && body.message.trim()) {
        return body.message;
      }
    }

    if (error.status === 0) {
      return 'No se pudo conectar con el servidor. Verifique que la API esté en ejecución.';
    }

    if (error.status === 401) {
      return 'Su sesión expiró o las credenciales no son válidas.';
    }

    if (error.status === 403) {
      return 'No tiene permisos para realizar esta acción.';
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

/** Detecta si el backend rechazó la operación por stock insuficiente. */
export function esErrorDeStock(error: unknown): boolean {
  const mensaje = obtenerMensajeError(error).toLowerCase();
  return mensaje.includes('stock') && (mensaje.includes('insuficiente') || mensaje.includes('disponible'));
}
