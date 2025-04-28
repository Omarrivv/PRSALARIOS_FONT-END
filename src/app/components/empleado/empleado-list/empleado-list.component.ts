import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmpleadoService } from '../../../services/empleado.service';
import { Empleado } from '../../../models/empleado.model';
import { EmpleadoFormComponent } from '../empleado-form/empleado-form.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-empleado-list',
  standalone: true,
  imports: [CommonModule, EmpleadoFormComponent],
  templateUrl: './empleado-list.component.html',
  styles: [`
    .container {
      padding: 2rem;
      background-color: #f8f9fa;
      min-height: 100vh;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding: 1rem;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    h1 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.8rem;
    }

    .table-container {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #e9ecef;
    }

    th {
      background-color: #f8f9fa;
      font-weight: 600;
      color: #2c3e50;
    }

    tr:hover {
      background-color: #f8f9fa;
    }

    .acciones {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background-color: #3498db;
      color: white;
    }

    .btn-primary:hover {
      background-color: #2980b9;
    }

    .btn-icon {
      padding: 0.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .btn-danger {
      background-color: #e74c3c;
      color: white;
    }

    .btn-danger:hover {
      background-color: #c0392b;
    }

    .icon {
      font-style: normal;
      font-size: 1.2rem;
    }

    .estado-activo {
      background-color: #2ecc71;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-size: 0.875rem;
    }

    .estado-inactivo {
      background-color: #95a5a6;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-size: 0.875rem;
    }

    .notificacion {
      position: fixed;
      top: 1rem;
      right: 1rem;
      padding: 1rem 2rem;
      background-color: #2ecc71;
      color: white;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      z-index: 1000;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class EmpleadoListComponent implements OnInit {
  empleados: Empleado[] = [];
  mostrarFormulario = false;
  empleadoSeleccionado?: Empleado;
  eliminandoEmpleado = false;
  cargando = false;

  constructor(private empleadoService: EmpleadoService) {}

  ngOnInit(): void {
    this.cargarEmpleados();
  }

  async cargarEmpleados(): Promise<void> {
    if (this.cargando) return;

    this.cargando = true;
    try {
      this.empleados = await firstValueFrom(this.empleadoService.listar());
    } catch (error: any) {
      console.error('Error al cargar empleados:', error);
      this.mostrarNotificacion(
        error.message || 'Error al cargar los empleados',
        'error'
      );
    } finally {
      this.cargando = false;
    }
  }

  abrirFormulario(empleado?: Empleado): void {
    this.empleadoSeleccionado = empleado;
    this.mostrarFormulario = true;
  }

  async eliminarEmpleado(id: number): Promise<void> {
    if (!id) {
      this.mostrarNotificacion('ID de empleado no válido', 'error');
      return;
    }

    if (this.eliminandoEmpleado) {
      return;
    }

    try {
      // Buscar el empleado en la lista local primero
      const empleado = this.empleados.find(e => e.idEmpleado === id);
      if (!empleado) {
        this.mostrarNotificacion('El empleado no existe en la lista actual', 'error');
        return;
      }

      const confirmar = await this.confirmarEliminacion(empleado);
      if (!confirmar) {
        return;
      }

      this.eliminandoEmpleado = true;

      try {
        await firstValueFrom(this.empleadoService.eliminar(id));
        this.mostrarNotificacion('Empleado eliminado correctamente', 'success');
        // Actualizar la lista local
        this.empleados = this.empleados.filter(e => e.idEmpleado !== id);
      } catch (error: any) {
        console.error('Error al eliminar empleado:', error);
        
        // Si el error es 404, actualizamos la lista local
        if (error.status === 404) {
          this.empleados = this.empleados.filter(e => e.idEmpleado !== id);
        }
        
        this.mostrarNotificacion(
          error.message || 'Error al eliminar el empleado',
          'error'
        );
      }
    } catch (error: any) {
      console.error('Error inesperado:', error);
      this.mostrarNotificacion(
        error.message || 'Error inesperado al procesar la solicitud',
        'error'
      );
    } finally {
      this.eliminandoEmpleado = false;
    }
  }

  private confirmarEliminacion(empleado: Empleado): Promise<boolean> {
    return new Promise((resolve) => {
      const mensaje = `¿Está seguro de eliminar al empleado ${empleado.nombres} ${empleado.apellidos}?`;
      const confirmacion = confirm(mensaje);
      resolve(confirmacion);
    });
  }

  async onGuardarEmpleado(): Promise<void> {
    this.mostrarFormulario = false;
    await this.cargarEmpleados();
  }

  onCancelar(): void {
    this.mostrarFormulario = false;
    this.empleadoSeleccionado = undefined;
  }

  private mostrarNotificacion(mensaje: string, tipo: 'success' | 'error'): void {
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion ${tipo}`;
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);

    setTimeout(() => {
      notificacion.remove();
    }, 5000);
  }
} 