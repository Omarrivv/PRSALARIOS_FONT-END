import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DescuentoService } from '../../../services/descuento.service';
import { Descuento } from '../../../models/descuento.model';
import { DescuentoFormComponent } from '../descuento-form/descuento-form.component';

@Component({
  selector: 'app-descuento-list',
  standalone: true,
  imports: [CommonModule, DescuentoFormComponent],
  templateUrl: './descuento-list.component.html',
  styles: []
})
export class DescuentoListComponent implements OnInit {
  descuentos: Descuento[] = [];
  mostrarFormulario = false;
  descuentoSeleccionado?: Descuento;

  constructor(private descuentoService: DescuentoService) {}

  ngOnInit(): void {
    this.cargarDescuentos();
  }

  cargarDescuentos(): void {
    this.descuentoService.listar().subscribe({
      next: (descuentos) => this.descuentos = descuentos,
      error: () => this.mostrarNotificacion('Error al cargar los descuentos')
    });
  }

  abrirFormulario(descuento?: Descuento): void {
    this.descuentoSeleccionado = descuento;
    this.mostrarFormulario = true;
  }

  eliminarDescuento(id: number): void {
    if (confirm('¿Está seguro de eliminar este registro de descuento?')) {
      this.descuentoService.eliminar(id).subscribe({
        next: () => {
          this.mostrarNotificacion('Descuento eliminado correctamente');
          this.cargarDescuentos();
        },
        error: () => this.mostrarNotificacion('Error al eliminar el descuento')
      });
    }
  }

  onGuardarDescuento(): void {
    this.mostrarFormulario = false;
    this.cargarDescuentos();
  }

  onCancelar(): void {
    this.mostrarFormulario = false;
    this.descuentoSeleccionado = undefined;
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