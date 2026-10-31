import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  Lote,
  Producto,
  ProductoCreate,
  ProductoCreadoResponse,
  ProductoFiltros,
  ProductoUpdate,
} from '../models/producto.model';
import { MessageResponse } from '../models/message.model';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/productos`;

  listar(filtros: ProductoFiltros = {}): Observable<Producto[]> {
    let params = new HttpParams();

    if (filtros.texto?.trim()) {
      params = params.set('texto', filtros.texto.trim());
    }
    if (filtros.id_categoria) {
      params = params.set('id_categoria', filtros.id_categoria);
    }
    if (filtros.solo_activos !== undefined) {
      params = params.set('solo_activos', filtros.solo_activos);
    }

    return this.http.get<Producto[]>(this.baseUrl, { params });
  }

  obtener(idProducto: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.baseUrl}/${idProducto}`);
  }

  listarLotes(idProducto: number): Observable<Lote[]> {
    return this.http.get<Lote[]>(`${this.baseUrl}/${idProducto}/lotes`);
  }

  crear(payload: ProductoCreate): Observable<ProductoCreadoResponse> {
    return this.http.post<ProductoCreadoResponse>(this.baseUrl, payload);
  }

  actualizar(idProducto: number, payload: ProductoUpdate): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(`${this.baseUrl}/${idProducto}`, payload);
  }

  desactivar(idProducto: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.baseUrl}/${idProducto}`);
  }
}
