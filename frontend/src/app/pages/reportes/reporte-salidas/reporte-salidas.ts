import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  FormField,
  FormRoot,
  form,
  max,
  min,
  required,
  validate,
} from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ProductoMayorSalida } from '../../../core/models/dashboard.model';
import { DashboardService } from '../../../core/services/dashboard.service';
import { obtenerMensajeError } from '../../../core/utils/http-error';
import { FieldError } from '../../../shared/field-error/field-error';
import { Icon } from '../../../shared/icon/icon';

interface FiltroReporteModel {
  fecha_desde: string;
  fecha_hasta: string;
  top_n: number;
}

function formatearFecha(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

function crearModeloInicial(): FiltroReporteModel {
  const hoy = new Date();
  const desde = new Date(hoy);
  desde.setDate(desde.getDate() - 29);
  return {
    fecha_desde: formatearFecha(desde),
    fecha_hasta: formatearFecha(hoy),
    top_n: 10,
  };
}

@Component({
  selector: 'app-reporte-salidas',
  imports: [FormField, FormRoot, RouterLink, Icon, FieldError, DecimalPipe],
  templateUrl: './reporte-salidas.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteSalidasPage implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  protected readonly modelo = signal<FiltroReporteModel>(crearModeloInicial());
  protected readonly filas = signal<ProductoMayorSalida[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly totalSalidas = computed(() =>
    this.filas().reduce((total, fila) => total + fila.total_salidas, 0),
  );

  protected readonly promedioSalidas = computed(() => {
    if (this.filas().length === 0) {
      return 0;
    }
    return Math.round(this.totalSalidas() / this.filas().length);
  });

  protected readonly maximoSalidas = computed(() =>
    this.filas().reduce((maximo, fila) => Math.max(maximo, fila.total_salidas), 0),
  );

  protected readonly reporteForm = form(
    this.modelo,
    (path) => {
      required(path.top_n, { message: 'Indique cuántos productos desea incluir.' });
      min(path.top_n, 1, { message: 'El reporte debe incluir al menos 1 producto.' });
      max(path.top_n, 100, { message: 'El reporte admite como máximo 100 productos.' });

      validate(path.fecha_desde, ({ value }) => {
        const desde = value();
        const hasta = this.modelo().fecha_hasta;
        if (desde && hasta && desde > hasta) {
          return {
            kind: 'rango',
            message: 'La fecha inicial no puede ser posterior a la fecha final.',
          };
        }
        return null;
      });

      validate(path.fecha_hasta, ({ value }) => {
        const hasta = value();
        const desde = this.modelo().fecha_desde;
        if (desde && hasta && desde > hasta) {
          return {
            kind: 'rango',
            message: 'La fecha final no puede ser anterior a la fecha inicial.',
          };
        }
        return null;
      });
    },
    {
      submission: {
        action: async () => {
          await this.cargar();
        },
      },
    },
  );

  ngOnInit(): void {
    void this.cargar();
  }

  protected async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);

    try {
      const modelo = this.modelo();
      const filas = await firstValueFrom(
        this.dashboardService.mayoresSalidas(
          modelo.fecha_desde || undefined,
          modelo.fecha_hasta || undefined,
          Number(modelo.top_n),
        ),
      );
      this.filas.set(filas);
    } catch (error) {
      this.error.set(obtenerMensajeError(error, 'No se pudo generar el reporte de salidas.'));
    } finally {
      this.cargando.set(false);
    }
  }

  protected restablecer(): void {
    this.modelo.set(crearModeloInicial());
    this.reporteForm().reset();
    void this.cargar();
  }

  protected porcentaje(total: number): number {
    const maximo = this.maximoSalidas();
    if (maximo <= 0) {
      return 0;
    }
    return Math.round((total / maximo) * 100);
  }

  protected exportarCsv(): void {
    if (this.filas().length === 0) {
      return;
    }

    const encabezado = ['Código', 'Producto', 'Categoría', 'Total de salidas'];
    const contenido = this.filas().map((fila) => [
      fila.codigo,
      fila.nombre,
      fila.categoria,
      String(fila.total_salidas),
    ]);

    const escapar = (valor: string): string => `"${valor.replace(/"/g, '""')}"`;
    const lineas = [encabezado, ...contenido].map((linea) => linea.map(escapar).join(';'));

    const blob = new Blob(['\ufeff' + lineas.join('\r\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `reporte-salidas-${this.modelo().fecha_desde}-${this.modelo().fecha_hasta}.csv`;
    enlace.click();
    URL.revokeObjectURL(url);
  }
}
