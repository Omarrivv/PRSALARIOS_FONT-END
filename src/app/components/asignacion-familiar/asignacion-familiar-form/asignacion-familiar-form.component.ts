import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AsignacionFamiliarService } from '../../../services/asignacion-familiar.service';
import { EmpleadoService } from '../../../services/empleado.service';
import { AsignacionFamiliar } from '../../../models/asignacion-familiar.model';
import { Empleado } from '../../../models/empleado.model';

@Component({
  selector: 'app-asignacion-familiar-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './asignacion-familiar-form.component.html',
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
export class AsignacionFamiliarFormComponent implements OnInit {
  @Input() asignacion?: AsignacionFamiliar;
  @Output() guardarAsignacion = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  form: FormGroup;
  empleados: Empleado[] = [];
  visible = true;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private asignacionService: AsignacionFamiliarService,
    private empleadoService: EmpleadoService
  ) {
    this.form = this.fb.group({
      empleadoId: ['', Validators.required],
      cantidadHijos: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.cargarEmpleados();
    if (this.asignacion) {
      this.isEdit = true;
      this.form.patchValue({
        empleadoId: this.asignacion.empleado.idEmpleado,
        cantidadHijos: this.asignacion.cantidadHijos
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
      const formValue = this.form.value;
      const empleadoSeleccionado = this.empleados.find(e => e.idEmpleado === +formValue.empleadoId);
      if (!empleadoSeleccionado) {
        this.mostrarNotificacion('Empleado no encontrado');
        return;
      }

      const asignacionData = {
        cantidadHijos: formValue.cantidadHijos,
        empleado: empleadoSeleccionado
      };

      const operacion = this.isEdit ?
        this.asignacionService.actualizar(this.asignacion!.idAsignacion!, asignacionData) :
        this.asignacionService.crear(asignacionData);

      operacion.subscribe({
        next: () => {
          this.mostrarNotificacion(
            this.isEdit ? 'Asignación familiar actualizada correctamente' : 'Asignación familiar registrada correctamente'
          );
          this.guardarAsignacion.emit();
          this.cerrar();
        },
        error: (error) => {
          if (error.error && typeof error.error === 'string') {
            this.mostrarNotificacion(error.error);
          } else {
            this.mostrarNotificacion('Error al guardar la asignación familiar');
          }
        }
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