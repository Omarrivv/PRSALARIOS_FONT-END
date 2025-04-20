import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmpleadoService } from '../../../services/empleado.service';
import { Empleado } from '../../../models/empleado.model';
import { EmpleadoFormComponent } from '../empleado-form/empleado-form.component';

@Component({
  selector: 'app-empleado-list',
  standalone: true,
  imports: [CommonModule, EmpleadoFormComponent],
  templateUrl: './empleado-list.component.html',
  styles: [`
    .acciones {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
    }
    
    .icon {
      font-style: normal;
      font-size: 1.2rem;
    }
  `]
})
export class EmpleadoListComponent implements OnInit {
  empleados: Empleado[] = [];
  mostrarFormulario = false;
  empleadoSeleccionado?: Empleado;

  constructor(private empleadoService: EmpleadoService) {}

  ngOnInit(): void {
    this.cargarEmpleados();
  }

  cargarEmpleados(): void {
    this.empleadoService.listar().subscribe({
      next: (empleados) => this.empleados = empleados,
      error: () => this.mostrarNotificacion('Error al cargar los empleados')
    });
  }

  abrirFormulario(empleado?: Empleado): void {
    this.empleadoSeleccionado = empleado;
    this.mostrarFormulario = true;
  }

  eliminarEmpleado(id: number): void {
    if (!id) return;

    if (confirm('¿Está seguro de eliminar este empleado?')) {
      this.empleadoService.eliminar(id).subscribe({
        next: () => {
          this.mostrarNotificacion('Empleado eliminado correctamente');
          this.cargarEmpleados();
        },
        error: () => this.mostrarNotificacion('Error al eliminar el empleado')
      });
    }
  }

  onGuardarEmpleado(): void {
    this.mostrarFormulario = false;
    this.cargarEmpleados();
  }

  onCancelar(): void {
    this.mostrarFormulario = false;
    this.empleadoSeleccionado = undefined;
  }

  private mostrarNotificacion(mensaje: string): void {
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion';
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);

    setTimeout(() => {
      notificacion.remove();
    }, 3000);
  }
} 