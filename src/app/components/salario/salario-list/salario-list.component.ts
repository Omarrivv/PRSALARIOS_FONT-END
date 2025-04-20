import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalarioService } from '../../../services/salario.service';
import { Salario } from '../../../models/salario.model';
import { SalarioFormComponent } from '../salario-form/salario-form.component';

@Component({
  selector: 'app-salario-list',
  standalone: true,
  imports: [CommonModule, SalarioFormComponent],
  templateUrl: './salario-list.component.html',
  styles: [`
    .estado-activo {
      color: #198754;
      background-color: #d1e7dd;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
    }
    
    .estado-inactivo {
      color: #dc3545;
      background-color: #f8d7da;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
    }
  `]
})
export class SalarioListComponent implements OnInit {
  salarios: Salario[] = [];
  mostrarFormulario = false;
  salarioSeleccionado?: Salario;

  constructor(private salarioService: SalarioService) {}

  ngOnInit(): void {
    this.cargarSalarios();
  }

  cargarSalarios(): void {
    this.salarioService.listar().subscribe({
      next: (salarios) => this.salarios = salarios,
      error: () => this.mostrarNotificacion('Error al cargar los salarios')
    });
  }

  abrirFormulario(salario?: Salario): void {
    this.salarioSeleccionado = salario;
    this.mostrarFormulario = true;
  }

  eliminarSalario(id: number): void {
    if (confirm('¿Está seguro de eliminar este registro de salario?')) {
      this.salarioService.eliminar(id).subscribe({
        next: () => {
          this.mostrarNotificacion('Salario eliminado correctamente');
          this.cargarSalarios();
        },
        error: () => this.mostrarNotificacion('Error al eliminar el salario')
      });
    }
  }

  onGuardarSalario(): void {
    this.mostrarFormulario = false;
    this.cargarSalarios();
  }

  onCancelar(): void {
    this.mostrarFormulario = false;
    this.salarioSeleccionado = undefined;
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