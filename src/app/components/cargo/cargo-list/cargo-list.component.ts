import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CargoService } from '../../../services/cargo.service';
import { Cargo } from '../../../models/cargo.model';
import { CargoFormComponent } from '../cargo-form/cargo-form.component';

@Component({
  selector: 'app-cargo-list',
  standalone: true,
  imports: [CommonModule, CargoFormComponent],
  templateUrl: './cargo-list.component.html',
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
export class CargoListComponent implements OnInit {
  cargos: Cargo[] = [];
  mostrarFormulario = false;
  cargoSeleccionado?: Cargo;

  constructor(private cargoService: CargoService) {}

  ngOnInit(): void {
    this.cargarCargos();
  }

  cargarCargos(): void {
    this.cargoService.listar().subscribe({
      next: (cargos) => this.cargos = cargos,
      error: () => this.mostrarNotificacion('Error al cargar los cargos')
    });
  }

  abrirFormulario(): void {
    this.mostrarFormulario = true;
    this.cargoSeleccionado = undefined;
  }

  editar(cargo: Cargo): void {
    this.cargoSeleccionado = cargo;
    this.mostrarFormulario = true;
  }

  eliminar(cargo: Cargo): void {
    if (!cargo.idCargo) return;
    
    if (confirm('¿Está seguro de eliminar este cargo?')) {
      this.cargoService.eliminar(cargo.idCargo).subscribe({
        next: () => {
          this.mostrarNotificacion('Cargo eliminado correctamente');
          this.cargarCargos();
        },
        error: () => this.mostrarNotificacion('Error al eliminar el cargo')
      });
    }
  }

  onGuardarCargo(): void {
    this.mostrarFormulario = false;
    this.cargarCargos();
  }

  onCancelar(): void {
    this.mostrarFormulario = false;
    this.cargoSeleccionado = undefined;
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