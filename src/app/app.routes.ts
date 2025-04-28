import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'empleados',
        loadComponent: () => import('./components/empleado/empleado-list/empleado-list.component')
          .then(m => m.EmpleadoListComponent)
      },
      {
        path: 'cargos',
        loadComponent: () => import('./components/cargo/cargo-list/cargo-list.component')
          .then(m => m.CargoListComponent)
      },
      {
        path: 'salarios',
        loadComponent: () => import('./components/salario/salario-list/salario-list.component')
          .then(m => m.SalarioListComponent)
      },
      {
        path: 'descuentos',
        loadComponent: () => import('./components/descuento/descuento-list/descuento-list.component')
          .then(m => m.DescuentoListComponent)
      },
      {
        path: 'asignaciones',
        loadComponent: () => import('./components/asignacion-familiar/asignacion-familiar-list/asignacion-familiar-list.component')
          .then(m => m.AsignacionFamiliarListComponent)
      },
      {
        path: 'boletas',
        loadComponent: () => import('./components/boleta-pago/boleta-pago-list/boleta-pago-list.component')
          .then(m => m.BoletaPagoListComponent)
      },
      {
        path: 'inicio',
        loadComponent: () => import('./components/inicio/inicio.component')
          .then(m => m.InicioComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
