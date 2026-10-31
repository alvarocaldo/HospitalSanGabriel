import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { MainLayout } from './layout/main-layout/main-layout';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Iniciar sesión · Hospital San Gabriel',
    loadComponent: () => import('./pages/login/login').then((m) => m.LoginPage),
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        title: 'Dashboard · Inventario',
        loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.DashboardPage),
      },
      {
        path: 'productos',
        title: 'Productos · Inventario',
        loadComponent: () =>
          import('./pages/productos/lista-productos/lista-productos').then((m) => m.ListaProductosPage),
      },
      {
        path: 'productos/nuevo',
        title: 'Nuevo producto · Inventario',
        loadComponent: () =>
          import('./pages/productos/form-producto/form-producto').then((m) => m.FormProductoPage),
      },
      {
        path: 'productos/:id/editar',
        title: 'Editar producto · Inventario',
        loadComponent: () =>
          import('./pages/productos/form-producto/form-producto').then((m) => m.FormProductoPage),
      },
      {
        path: 'categorias',
        title: 'Categorías · Inventario',
        loadComponent: () =>
          import('./pages/categorias/lista-categorias/lista-categorias').then((m) => m.ListaCategoriasPage),
      },
      {
        path: 'entradas/nueva',
        title: 'Registrar entrada · Inventario',
        loadComponent: () =>
          import('./pages/movimientos/form-entrada/form-entrada').then((m) => m.FormEntradaPage),
      },
      {
        path: 'salidas/nueva',
        title: 'Registrar salida · Inventario',
        loadComponent: () =>
          import('./pages/movimientos/form-salida/form-salida').then((m) => m.FormSalidaPage),
      },
      {
        path: 'movimientos',
        title: 'Movimientos · Inventario',
        loadComponent: () =>
          import('./pages/movimientos/lista-movimientos/lista-movimientos').then((m) => m.ListaMovimientosPage),
      },
      {
        path: 'alertas/stock-bajo',
        title: 'Stock bajo · Inventario',
        loadComponent: () =>
          import('./pages/alertas/lista-stock-bajo/lista-stock-bajo').then((m) => m.ListaStockBajoPage),
      },
      {
        path: 'alertas/vencimientos',
        title: 'Vencimientos · Inventario',
        loadComponent: () =>
          import('./pages/alertas/lista-vencimientos/lista-vencimientos').then((m) => m.ListaVencimientosPage),
      },
      {
        path: 'reportes/salidas',
        title: 'Reporte de salidas · Inventario',
        loadComponent: () =>
          import('./pages/reportes/reporte-salidas/reporte-salidas').then((m) => m.ReporteSalidasPage),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
