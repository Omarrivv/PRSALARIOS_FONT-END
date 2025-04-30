import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AsignacionFamiliarService } from '../../../services/asignacion-familiar.service';
import { AsignacionFamiliar } from '../../../models/asignacion-familiar.model';
import { AsignacionFamiliarFormComponent } from '../asignacion-familiar-form/asignacion-familiar-form.component';
import { CurrencyFormatPipe } from '../../../pipes/currency.pipe';

@Component({
  selector: 'app-asignacion-familiar-list',
  standalone: true,
  imports: [CommonModule, HttpClientModule, AsignacionFamiliarFormComponent, CurrencyFormatPipe],
  templateUrl: './asignacion-familiar-list.component.html',
  providers: [AsignacionFamiliarService],
  styles: [`
    .detalle-container {
      padding: 1.5rem;
      background-color: #f8f9fa;
      border-radius: 8px;
    }
    .detalle-grupo {
      margin-bottom: 1.5rem;
      padding: 1rem;
      background-color: white;
      border-radius: 6px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .detalle-grupo h3 {
      color: #2c3e50;
      margin-bottom: 1rem;
      font-size: 1.2rem;
      border-bottom: 2px solid #e9ecef;
      padding-bottom: 0.5rem;
    }
    .detalle-grupo p {
      margin: 0.5rem 0;
      color: #495057;
    }
    .detalle-grupo strong {
      color: #2c3e50;
      margin-right: 0.5rem;
    }
    .btn-info {
      background-color: #17a2b8;
      color: white;
    }
    .btn-info:hover {
      background-color: #138496;
    }
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
export class AsignacionFamiliarListComponent implements OnInit {
  asignaciones: AsignacionFamiliar[] = [];
  mostrarFormulario = false;
  asignacionSeleccionada?: AsignacionFamiliar;
  asignacionDetalle?: AsignacionFamiliar;

  constructor(private asignacionService: AsignacionFamiliarService) {
    console.log('AsignacionFamiliarListComponent inicializado');
  }

  ngOnInit(): void {
    console.log('Cargando asignaciones...');
    this.cargarAsignaciones();
  }

  cargarAsignaciones(): void {
    this.asignacionService.listar().subscribe({
      next: (asignaciones) => {
        console.log('Asignaciones recibidas:', asignaciones);
        this.asignaciones = asignaciones;
      },
      error: (error) => {
        console.error('Error al cargar asignaciones:', error);
        this.mostrarNotificacion('Error al cargar las asignaciones familiares');
      }
    });
  }

  verDetalle(asignacion: AsignacionFamiliar): void {
    this.asignacionDetalle = asignacion;
  }

  cerrarDetalle(): void {
    this.asignacionDetalle = undefined;
  }

  abrirFormulario(asignacion?: AsignacionFamiliar): void {
    this.asignacionSeleccionada = asignacion;
    this.mostrarFormulario = true;
  }

  eliminarAsignacion(id: number): void {
    if (confirm('¿Está seguro de eliminar esta asignación familiar?')) {
      this.asignacionService.eliminar(id).subscribe({
        next: () => {
          this.mostrarNotificacion('Asignación familiar eliminada correctamente');
          this.cargarAsignaciones();
        },
        error: () => this.mostrarNotificacion('Error al eliminar la asignación familiar')
      });
    }
  }

  onGuardarAsignacion(): void {
    this.mostrarFormulario = false;
    this.cargarAsignaciones();
  }

  onCancelar(): void {
    this.mostrarFormulario = false;
    this.asignacionSeleccionada = undefined;
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