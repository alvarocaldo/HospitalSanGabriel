import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Area } from '../models/area.model';

@Injectable({ providedIn: 'root' })
export class AreaService {
  private readonly http = inject(HttpClient);

  listar(): Observable<Area[]> {
    return this.http.get<Area[]>(`${environment.apiUrl}/areas`);
  }
}
