import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'empleados', pathMatch: 'full' },
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
    path: 'asignaciones-familiares',
    loadComponent: () => import('./components/asignacion-familiar/asignacion-familiar-list/asignacion-familiar-list.component')
      .then(m => m.AsignacionFamiliarListComponent)
  }
]; 