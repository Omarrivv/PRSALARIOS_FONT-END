import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BoletaPagoService } from '../../../services/boleta-pago.service';
import { EmpleadoService } from '../../../services/empleado.service';
import { SalarioService } from '../../../services/salario.service';
import { DescuentoService } from '../../../services/descuento.service';
import { AsignacionFamiliarService } from '../../../services/asignacion-familiar.service';
import { BoletaPago } from '../../../models/boleta-pago.model';
import { Empleado } from '../../../models/empleado.model';
import { Salario } from '../../../models/salario.model';
import { Descuento } from '../../../models/descuento.model';
import { AsignacionFamiliar } from '../../../models/asignacion-familiar.model';

@Component({
  selector: 'app-boleta-pago-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './boleta-pago-form.component.html',
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
export class BoletaPagoFormComponent implements OnInit {
  @Input() boleta?: BoletaPago;
  @Output() guardarBoleta = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  form: FormGroup;
  empleados: Empleado[] = [];
  salarios: Salario[] = [];
  descuentos: Descuento[] = [];
  asignaciones: AsignacionFamiliar[] = [];
  visible = true;
  isEdit = false;

  private todosSalarios: Salario[] = [];
  private todosDescuentos: Descuento[] = [];
  private todasAsignaciones: AsignacionFamiliar[] = [];

  constructor(
    private fb: FormBuilder,
    private boletaService: BoletaPagoService,
    private empleadoService: EmpleadoService,
    private salarioService: SalarioService,
    private descuentoService: DescuentoService,
    private asignacionService: AsignacionFamiliarService
  ) {
    this.form = this.fb.group({
      empleadoId: ['', Validators.required],
      fechaEmision: ['', Validators.required],
      salarioId: ['', Validators.required],
      descuentoId: ['', Validators.required],
      asignacionId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
    this.form.get('empleadoId')?.valueChanges.subscribe((empleadoId) => {
      this.filtrarDatosPorEmpleado(empleadoId);
      // Limpiar selección de salario, descuento y asignación al cambiar empleado
      this.form.patchValue({ salarioId: '', descuentoId: '', asignacionId: '' });
    });
    if (this.boleta) {
      this.isEdit = true;
      this.form.patchValue({
        empleadoId: this.boleta.empleado.idEmpleado,
        fechaEmision: this.boleta.fechaEmision,
        salarioId: this.boleta.salario.idSalario,
        descuentoId: this.boleta.descuento.idDescuento,
        asignacionId: this.boleta.asignacionFamiliar.idAsignacion
      });
    }
  }

  cargarDatos(): void {
    this.empleadoService.listar().subscribe({
      next: (empleados) => this.empleados = empleados,
      error: () => this.mostrarNotificacion('Error al cargar los empleados')
    });

    this.salarioService.listar().subscribe({
      next: (salarios) => {
        this.todosSalarios = salarios;
        this.salarios = salarios;
      },
      error: () => this.mostrarNotificacion('Error al cargar los salarios')
    });

    this.descuentoService.listar().subscribe({
      next: (descuentos) => {
        this.todosDescuentos = descuentos;
        this.descuentos = descuentos;
      },
      error: () => this.mostrarNotificacion('Error al cargar los descuentos')
    });

    this.asignacionService.listar().subscribe({
      next: (asignaciones) => {
        this.todasAsignaciones = asignaciones;
        this.asignaciones = asignaciones;
      },
      error: () => this.mostrarNotificacion('Error al cargar las asignaciones')
    });
  }

  filtrarDatosPorEmpleado(empleadoId: number) {
    if (!empleadoId) {
      this.salarios = this.todosSalarios;
      this.descuentos = this.todosDescuentos;
      this.asignaciones = this.todasAsignaciones;
      return;
    }
    this.salarios = this.todosSalarios.filter(s => s.empleado.idEmpleado === +empleadoId);
    this.descuentos = this.todosDescuentos.filter(d => d.empleado.idEmpleado === +empleadoId);
    this.asignaciones = this.todasAsignaciones.filter(a => a.empleado.idEmpleado === +empleadoId);
  }

  guardar(): void {
    if (this.form.valid) {
      const formValue = this.form.value;
      const empleado = this.empleados.find(e => e.idEmpleado === +formValue.empleadoId);
      const salario = this.salarios.find(s => s.idSalario === +formValue.salarioId);
      const descuento = this.descuentos.find(d => d.idDescuento === +formValue.descuentoId);
      const asignacion = this.asignaciones.find(a => a.idAsignacion === +formValue.asignacionId);

      if (!empleado || !salario || !descuento || !asignacion) {
        this.mostrarNotificacion('Error: Datos no encontrados');
        return;
      }

      const boletaData = {
        empleado,
        fechaEmision: formValue.fechaEmision,
        salario,
        descuento,
        asignacionFamiliar: asignacion,
        totalNeto: (salario?.totalBruto ?? 0) - (descuento?.totalDescuento ?? 0) + (asignacion?.montoAsignacion ?? 0)
      };

      const operacion = this.isEdit ?
        this.boletaService.actualizar(this.boleta!.idBoleta!, boletaData) :
        this.boletaService.crear(boletaData);

      operacion.subscribe({
        next: () => {
          this.mostrarNotificacion(
            this.isEdit ? 'Boleta actualizada correctamente' : 'Boleta registrada correctamente'
          );
          this.guardarBoleta.emit();
          this.cerrar();
        },
        error: (error) => {
          if (error.error && typeof error.error === 'string') {
            this.mostrarNotificacion(error.error);
          } else {
            this.mostrarNotificacion('Error al guardar la boleta');
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