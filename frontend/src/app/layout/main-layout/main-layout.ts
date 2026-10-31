import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { Icon } from '../../shared/icon/icon';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  exact: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgClass, Icon],
  templateUrl: './main-layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayout {
  protected readonly auth = inject(AuthService);
  protected readonly sidebarOpen = signal(false);

  protected readonly grupos: NavGroup[] = [
    {
      title: 'Operación',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: 'home', exact: true },
        { label: 'Productos', path: '/productos', icon: 'cube', exact: false },
        { label: 'Categorías', path: '/categorias', icon: 'tag', exact: false },
        { label: 'Movimientos', path: '/movimientos', icon: 'clipboard', exact: false },
      ],
    },
    {
      title: 'Registrar movimiento',
      items: [
        { label: 'Nueva entrada', path: '/entradas/nueva', icon: 'arrow-down-tray', exact: false },
        { label: 'Nueva salida', path: '/salidas/nueva', icon: 'arrow-up-tray', exact: false },
      ],
    },
    {
      title: 'Alertas y reportes',
      items: [
        { label: 'Stock bajo', path: '/alertas/stock-bajo', icon: 'warning', exact: false },
        { label: 'Vencimientos', path: '/alertas/vencimientos', icon: 'clock', exact: false },
        { label: 'Reporte de salidas', path: '/reportes/salidas', icon: 'chart', exact: false },
      ],
    },
  ];

  protected readonly usuario = this.auth.currentUser;
  protected readonly iniciales = computed(() => {
    const nombre = this.auth.currentUser()?.nombre_completo?.trim();
    if (!nombre) {
      return 'US';
    }
    return nombre
      .split(/\s+/)
      .slice(0, 2)
      .map((parte) => parte.charAt(0).toUpperCase())
      .join('');
  });

  protected closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  protected logout(): void {
    this.auth.logout();
  }
}
