import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  Categoria,
  CategoriaCreate,
  CategoriaCreadaResponse,
  CategoriaUpdate,
} from '../models/categoria.model';
import { MessageResponse } from '../models/message.model';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/categorias`;

  listar(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.baseUrl);
  }

  crear(payload: CategoriaCreate): Observable<CategoriaCreadaResponse> {
    return this.http.post<CategoriaCreadaResponse>(this.baseUrl, payload);
  }

  actualizar(idCategoria: number, payload: CategoriaUpdate): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(`${this.baseUrl}/${idCategoria}`, payload);
  }
}
