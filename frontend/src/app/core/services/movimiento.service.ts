import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  Entrada,
  EntradaRegistradaResponse,
  Movimiento,
  MovimientoFiltros,
  Salida,
  SalidaRegistradaResponse,
} from '../models/movimiento.model';

@Injectable({ providedIn: 'root' })
export class MovimientoService {
  private readonly http = inject(HttpClient);

  listar(filtros: MovimientoFiltros = {}): Observable<Movimiento[]> {
    let params = new HttpParams();

    if (filtros.id_producto) {
      params = params.set('id_producto', filtros.id_producto);
    }
    if (filtros.tipo) {
      params = params.set('tipo', filtros.tipo);
    }
    if (filtros.id_area) {
      params = params.set('id_area', filtros.id_area);
    }
    if (filtros.fecha_desde) {
      params = params.set('fecha_desde', filtros.fecha_desde);
    }
    if (filtros.fecha_hasta) {
      params = params.set('fecha_hasta', filtros.fecha_hasta);
    }

    return this.http.get<Movimiento[]>(`${environment.apiUrl}/movimientos`, { params });
  }

  registrarEntrada(payload: Entrada): Observable<EntradaRegistradaResponse> {
    return this.http.post<EntradaRegistradaResponse>(`${environment.apiUrl}/entradas`, payload);
  }

  registrarSalida(payload: Salida): Observable<SalidaRegistradaResponse> {
    return this.http.post<SalidaRegistradaResponse>(`${environment.apiUrl}/salidas`, payload);
  }
}
