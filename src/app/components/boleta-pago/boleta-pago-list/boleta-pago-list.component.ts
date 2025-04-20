import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BoletaPagoService } from '../../../services/boleta-pago.service';
import { BoletaPago } from '../../../models/boleta-pago.model';
import { BoletaPagoFormComponent } from '../boleta-pago-form/boleta-pago-form.component';

@Component({
  selector: 'app-boleta-pago-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, BoletaPagoFormComponent],
  templateUrl: './boleta-pago-list.component.html',
  styles: [`
    .filtros {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      padding: 1rem;
      background-color: #f8f9fa;
      border-radius: 8px;
    }
    .form-group {
      flex: 1;
    }
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
  `]
})
export class BoletaPagoListComponent implements OnInit {
  boletas: BoletaPago[] = [];
  mostrarFormulario = false;
  boletaSeleccionada?: BoletaPago;
  boletaDetalle?: BoletaPago;
  filtroForm: FormGroup;

  constructor(
    private boletaService: BoletaPagoService,
    private fb: FormBuilder
  ) {
    this.filtroForm = this.fb.group({
      fechaInicio: [''],
      fechaFin: [''],
      idEmpleado: ['']
    });
  }

  ngOnInit(): void {
    this.cargarBoletas();
  }

  cargarBoletas(): void {
    this.boletaService.listar().subscribe({
      next: (boletas) => this.boletas = boletas,
      error: () => this.mostrarNotificacion('Error al cargar las boletas de pago')
    });
  }

  filtrarBoletas(): void {
    const { fechaInicio, fechaFin, idEmpleado } = this.filtroForm.value;

    if (fechaInicio && fechaFin) {
      this.boletaService.buscarPorPeriodo(new Date(fechaInicio), new Date(fechaFin))
        .subscribe({
          next: (boletas) => this.boletas = boletas,
          error: () => this.mostrarNotificacion('Error al filtrar las boletas')
        });
    } else if (idEmpleado) {
      this.boletaService.buscarPorEmpleado(idEmpleado)
        .subscribe({
          next: (boletas) => this.boletas = boletas,
          error: () => this.mostrarNotificacion('Error al filtrar las boletas')
        });
    }
  }

  verDetalle(boleta: BoletaPago): void {
    this.boletaDetalle = boleta;
  }

  cerrarDetalle(): void {
    this.boletaDetalle = undefined;
  }

  abrirFormulario(boleta?: BoletaPago): void {
    this.boletaSeleccionada = boleta;
    this.mostrarFormulario = true;
  }

  eliminarBoleta(id: number): void {
    if (confirm('¿Está seguro de eliminar esta boleta de pago?')) {
      this.boletaService.eliminar(id).subscribe({
        next: () => {
          this.mostrarNotificacion('Boleta eliminada correctamente');
          this.cargarBoletas();
        },
        error: () => this.mostrarNotificacion('Error al eliminar la boleta')
      });
    }
  }

  onGuardarBoleta(): void {
    this.mostrarFormulario = false;
    this.cargarBoletas();
  }

  onCancelar(): void {
    this.mostrarFormulario = false;
    this.boletaSeleccionada = undefined;
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