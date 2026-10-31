import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  DashboardIndicadores,
  ProductoMayorSalida,
  ProductoPorVencer,
  ProductoStockBajo,
  ProductoVencido,
} from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/dashboard`;

  indicadores(): Observable<DashboardIndicadores> {
    return this.http.get<DashboardIndicadores>(`${this.baseUrl}/indicadores`);
  }

  mayoresSalidas(fechaDesde?: string, fechaHasta?: string, topN = 10): Observable<ProductoMayorSalida[]> {
    let params = new HttpParams().set('top_n', topN);

    if (fechaDesde) {
      params = params.set('fecha_desde', fechaDesde);
    }
    if (fechaHasta) {
      params = params.set('fecha_hasta', fechaHasta);
    }

    return this.http.get<ProductoMayorSalida[]>(`${this.baseUrl}/mayores-salidas`, { params });
  }

  stockBajo(): Observable<ProductoStockBajo[]> {
    return this.http.get<ProductoStockBajo[]>(`${this.baseUrl}/alertas/stock-bajo`);
  }

  proximosVencer(dias = 30): Observable<ProductoPorVencer[]> {
    const params = new HttpParams().set('dias', dias);
    return this.http.get<ProductoPorVencer[]>(`${this.baseUrl}/alertas/proximos-vencer`, { params });
  }

  vencidos(): Observable<ProductoVencido[]> {
    return this.http.get<ProductoVencido[]>(`${this.baseUrl}/alertas/vencidos`);
  }
}
