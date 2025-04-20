import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DescuentoService } from '../../../services/descuento.service';
import { EmpleadoService } from '../../../services/empleado.service';
import { Descuento } from '../../../models/descuento.model';
import { Empleado } from '../../../models/empleado.model';

@Component({
  selector: 'app-descuento-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './descuento-form.component.html',
  styles: [`
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.5rem;
    }

    .modal-footer {
      margin-top: 2rem;
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }
  `]
})
export class DescuentoFormComponent implements OnInit {
  @Input() descuento?: Descuento;
  @Output() guardarDescuento = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  form: FormGroup;
  empleados: Empleado[] = [];
  visible = true;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private descuentoService: DescuentoService,
    private empleadoService: EmpleadoService
  ) {
    this.form = this.fb.group({
      empleado: ['', Validators.required],
      afp: [0, [Validators.required, Validators.min(0)]],
      onp: [0, [Validators.required, Validators.min(0)]],
      essalud: [0, [Validators.required, Validators.min(0)]],
      impuestoRenta: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.cargarEmpleados();
    if (this.descuento) {
      this.isEdit = true;
      this.form.patchValue({
        empleado: this.descuento.empleado.idEmpleado,
        afp: this.descuento.afp,
        onp: this.descuento.onp,
        essalud: this.descuento.essalud,
        impuestoRenta: this.descuento.impuestoRenta
      });
    }
  }

  cargarEmpleados(): void {
    this.empleadoService.listar().subscribe({
      next: (empleados) => this.empleados = empleados,
      error: () => this.mostrarNotificacion('Error al cargar los empleados')
    });
  }

  guardar(): void {
    if (this.form.valid) {
      const descuento = this.form.value;
      const empleadoSeleccionado = this.empleados.find(e => e.idEmpleado === +descuento.empleado);
      if (!empleadoSeleccionado) {
        this.mostrarNotificacion('Empleado no encontrado');
        return;
      }

      const descuentoData = {
        ...descuento,
        empleado: empleadoSeleccionado
      };

      const operacion = this.isEdit ?
        this.descuentoService.actualizar(this.descuento!.idDescuento!, descuentoData) :
        this.descuentoService.crear(descuentoData);

      operacion.subscribe({
        next: () => {
          this.mostrarNotificacion(
            this.isEdit ? 'Descuento actualizado correctamente' : 'Descuento registrado correctamente'
          );
          this.guardarDescuento.emit();
          this.cerrar();
        },
        error: () => this.mostrarNotificacion('Error al guardar el descuento')
      });
    }
  }

  cerrar(): void {
    this.visible = false;
    this.cancelar.emit();
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