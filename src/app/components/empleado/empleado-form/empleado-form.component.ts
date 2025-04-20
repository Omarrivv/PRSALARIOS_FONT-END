import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmpleadoService } from '../../../services/empleado.service';
import { CargoService } from '../../../services/cargo.service';
import { Empleado } from '../../../models/empleado.model';
import { Cargo } from '../../../models/cargo.model';

@Component({
  selector: 'app-empleado-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './empleado-form.component.html',
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
export class EmpleadoFormComponent implements OnInit {
  @Input() empleado?: Empleado;
  @Output() guardarEmpleado = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  form: FormGroup;
  cargos: Cargo[] = [];
  visible = true;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private empleadoService: EmpleadoService,
    private cargoService: CargoService
  ) {
    this.form = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      telefono: ['', Validators.pattern('^[0-9]{9}$')],
      email: ['', Validators.email],
      direccion: [''],
      fechaNacimiento: ['', Validators.required],
      fechaIngreso: ['', Validators.required],
      cargo: ['', Validators.required],
      estado: ['Activo', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarCargos();
    if (this.empleado) {
      this.isEdit = true;
      const fechaNacimiento = this.formatearFecha(this.empleado.fechaNacimiento);
      const fechaIngreso = this.formatearFecha(this.empleado.fechaIngreso);
      
      this.form.patchValue({
        ...this.empleado,
        cargo: this.empleado.cargo.idCargo,
        fechaNacimiento: fechaNacimiento,
        fechaIngreso: fechaIngreso
      });
    }
  }

  private formatearFecha(fecha: string | Date): string {
    const date = new Date(fecha);
    return date.toISOString().split('T')[0];
  }

  cargarCargos(): void {
    this.cargoService.listar().subscribe({
      next: (cargos) => this.cargos = cargos,
      error: () => this.mostrarNotificacion('Error al cargar los cargos')
    });
  }

  guardar(): void {
    if (this.form.valid) {
      const empleado = this.form.value;
      const operacion = this.isEdit ?
        this.empleadoService.actualizar(this.empleado!.idEmpleado, empleado) :
        this.empleadoService.crear(empleado);

      operacion.subscribe({
        next: () => {
          this.mostrarNotificacion(
            this.isEdit ? 'Empleado actualizado correctamente' : 'Empleado creado correctamente'
          );
          this.guardarEmpleado.emit();
          this.cerrar();
        },
        error: () => this.mostrarNotificacion('Error al guardar el empleado')
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