import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { EmpleadoService } from '../../../services/empleado.service';
import { CargoService } from '../../../services/cargo.service';
import { Empleado } from '../../../models/empleado.model';
import { Cargo } from '../../../models/cargo.model';

interface EmpleadoData {
  dni: string;
  nombres: string;
  apellidos: string;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  fechaNacimiento: string;
  fechaIngreso: string;
  cargo: { idCargo: number };
  estado: string;
  idEmpleado?: number;
}

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
      max-width: 800px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e9ecef;
    }

    .modal-header h2 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.5rem;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #7f8c8d;
      padding: 0.5rem;
      transition: color 0.3s ease;
    }

    .btn-close:hover {
      color: #2c3e50;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    label {
      font-weight: 500;
      color: #2c3e50;
      font-size: 0.875rem;
    }

    input, select {
      padding: 0.75rem;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      font-size: 0.875rem;
      transition: all 0.3s ease;
    }

    input:focus, select:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }

    input.invalid, select.invalid {
      border-color: #e74c3c;
    }

    input.invalid:focus, select.invalid:focus {
      box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2);
    }

    .error-message {
      color: #e74c3c;
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e9ecef;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .btn-primary {
      background-color: #3498db;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #2980b9;
    }

    .btn-secondary {
      background-color: #95a5a6;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #7f8c8d;
    }

    @media (max-width: 768px) {
      .modal-content {
        width: 95%;
        padding: 1rem;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class EmpleadoFormComponent implements OnInit {
  @Input() empleado?: Empleado;
  @Output() guardarEmpleado = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  form!: FormGroup;
  cargos: Cargo[] = [];
  visible = true;
  isEdit = false;
  enviandoFormulario = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private empleadoService: EmpleadoService,
    private cargoService: CargoService
  ) {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group({
      dni: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{8}$')
      ]],
      nombres: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')
      ]],
      apellidos: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')
      ]],
      telefono: ['', [
        Validators.pattern('^[0-9]{9}$')
      ]],
      email: ['', [
        Validators.email,
        Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')
      ]],
      direccion: ['', [
        Validators.maxLength(200)
      ]],
      fechaNacimiento: ['', [
        Validators.required,
        this.fechaNacimientoValidator()
      ]],
      fechaIngreso: ['', [
        Validators.required,
        this.fechaIngresoValidator()
      ]],
      cargo: ['', Validators.required],
      estado: ['Activo', Validators.required]
    });

    // Suscribirse a cambios en fechaNacimiento para validar fechaIngreso
    this.form.get('fechaNacimiento')?.valueChanges.subscribe(() => {
      this.form.get('fechaIngreso')?.updateValueAndValidity();
    });
  }

  private fechaNacimientoValidator() {
    return (control: AbstractControl): {[key: string]: any} | null => {
      if (!control.value) {
        return null;
      }

      const fechaNacimiento = new Date(control.value);
      const hoy = new Date();
      const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();

      // Verificar que la fecha no sea futura
      if (fechaNacimiento > hoy) {
        return { fechaFutura: true };
      }

      // Verificar edad mínima (18 años) y máxima (70 años)
      if (edad < 18) {
        return { edadMinima: true };
      }
      if (edad > 70) {
        return { edadMaxima: true };
      }

      return null;
    };
  }

  private fechaIngresoValidator() {
    return (control: AbstractControl): {[key: string]: any} | null => {
      if (!control.value) {
        return null;
      }

      const fechaIngreso = new Date(control.value);
      const hoy = new Date();
      const fechaNacimiento = this.form?.get('fechaNacimiento')?.value ? 
        new Date(this.form.get('fechaNacimiento')?.value) : null;

      // Verificar que la fecha no sea futura
      if (fechaIngreso > hoy) {
        return { fechaFutura: true };
      }

      // Verificar que la fecha de ingreso sea posterior a la fecha de nacimiento + 18 años
      if (fechaNacimiento) {
        const fechaMinima = new Date(fechaNacimiento);
        fechaMinima.setFullYear(fechaMinima.getFullYear() + 18);
        if (fechaIngreso < fechaMinima) {
          return { fechaIngresoInvalida: true };
        }
      }

      return null;
    };
  }

  ngOnInit(): void {
    this.cargarCargos();
    if (this.empleado) {
      this.isEdit = true;
      this.patchFormValues();
    }
  }

  private patchFormValues(): void {
    if (!this.empleado) return;

    try {
      const fechaNacimiento = this.formatearFecha(this.empleado.fechaNacimiento);
      const fechaIngreso = this.formatearFecha(this.empleado.fechaIngreso);
      
      this.form.patchValue({
        dni: this.empleado.dni,
        nombres: this.empleado.nombres,
        apellidos: this.empleado.apellidos,
        telefono: this.empleado.telefono || '',
        email: this.empleado.email || '',
        direccion: this.empleado.direccion || '',
        fechaNacimiento: fechaNacimiento,
        fechaIngreso: fechaIngreso,
        cargo: this.empleado.cargo.idCargo,
        estado: this.empleado.estado
      });
    } catch (error) {
      console.error('Error al cargar los datos del empleado:', error);
      this.mostrarError('Error al cargar los datos del empleado');
    }
  }

  private formatearFecha(fecha: string | Date): string {
    try {
      const date = new Date(fecha);
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return '';
    }
  }

  cargarCargos(): void {
    this.cargoService.listar().subscribe({
      next: (cargos) => this.cargos = cargos,
      error: (error) => {
        console.error('Error al cargar cargos:', error);
        this.mostrarError('Error al cargar los cargos');
      }
    });
  }

  guardar(): void {
    if (this.form.invalid || this.enviandoFormulario) {
      this.marcarCamposComoTocados();
      return;
    }

    this.enviandoFormulario = true;
    this.errorMessage = '';

    try {
      const empleadoData = this.prepararDatosParaEnvio();

      const operacion = this.isEdit ?
        this.empleadoService.actualizar(this.empleado!.idEmpleado!, empleadoData) :
        this.empleadoService.crear(empleadoData);

      operacion.subscribe({
        next: () => {
          this.mostrarNotificacion(
            this.isEdit ? 'Empleado actualizado correctamente' : 'Empleado creado correctamente',
            'success'
          );
          this.guardarEmpleado.emit();
          this.cerrar();
        },
        error: (error) => {
          console.error('Error al guardar empleado:', error);
          this.enviandoFormulario = false;
          
          if (error.status === 400) {
            this.mostrarError(error.message || 'Error de validación: ' + (error.error?.message || 'Datos inválidos'));
          } else if (error.status === 409) {
            this.mostrarError('Ya existe un empleado con ese DNI');
          } else if (error.status === 404) {
            this.mostrarError('El empleado no existe o ya fue eliminado');
          } else if (error.status === 422) {
            this.mostrarError('Error de validación: ' + (error.error?.message || 'Datos inválidos'));
          } else {
            this.mostrarError('Error al guardar el empleado. Por favor, intente nuevamente.');
          }
        }
      });
    } catch (error: any) {
      console.error('Error al preparar datos:', error);
      this.enviandoFormulario = false;
      this.mostrarError(error.message || 'Error al preparar los datos del empleado');
    }
  }

  private prepararDatosParaEnvio(): EmpleadoData {
    const formValues = this.form.value;
    
    // Validar campos requeridos
    const camposRequeridos = ['dni', 'nombres', 'apellidos', 'fechaNacimiento', 'fechaIngreso', 'cargo'];
    const camposFaltantes = camposRequeridos.filter(campo => !formValues[campo]);
    
    if (camposFaltantes.length > 0) {
      throw new Error(`Faltan campos requeridos: ${camposFaltantes.join(', ')}`);
    }

    // Validar formato de DNI
    if (!/^\d{8}$/.test(formValues.dni)) {
      throw new Error('El DNI debe tener exactamente 8 dígitos numéricos');
    }

    // Validar formato de teléfono si existe
    if (formValues.telefono && !/^\d{9}$/.test(formValues.telefono)) {
      throw new Error('El teléfono debe tener exactamente 9 dígitos numéricos');
    }

    // Validar formato de email si existe
    if (formValues.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
      throw new Error('El formato del email no es válido');
    }

    // Validar fechas
    const fechaNacimiento = new Date(formValues.fechaNacimiento);
    const fechaIngreso = new Date(formValues.fechaIngreso);
    const hoy = new Date();

    if (isNaN(fechaNacimiento.getTime())) {
      throw new Error('La fecha de nacimiento no es válida');
    }

    if (isNaN(fechaIngreso.getTime())) {
      throw new Error('La fecha de ingreso no es válida');
    }

    // Validar que la fecha de ingreso no sea futura
    if (fechaIngreso > hoy) {
      throw new Error('La fecha de ingreso no puede ser futura');
    }

    // Validar que la fecha de nacimiento no sea futura
    if (fechaNacimiento > hoy) {
      throw new Error('La fecha de nacimiento no puede ser futura');
    }

    // Validar edad mínima (18 años)
    const edadMinima = new Date(fechaNacimiento);
    edadMinima.setFullYear(edadMinima.getFullYear() + 18);
    if (fechaIngreso < edadMinima) {
      throw new Error('El empleado debe tener al menos 18 años al momento del ingreso');
    }

    // Validar que la fecha de ingreso sea posterior a la fecha de nacimiento
    if (fechaIngreso < fechaNacimiento) {
      throw new Error('La fecha de ingreso debe ser posterior a la fecha de nacimiento');
    }

    // Crear objeto de empleado
    const empleadoData: EmpleadoData = {
      dni: formValues.dni,
      nombres: formValues.nombres.trim(),
      apellidos: formValues.apellidos.trim(),
      telefono: formValues.telefono || null,
      email: formValues.email || null,
      direccion: formValues.direccion || null,
      fechaNacimiento: fechaNacimiento.toISOString().split('T')[0],
      fechaIngreso: fechaIngreso.toISOString().split('T')[0],
      cargo: { idCargo: formValues.cargo },
      estado: formValues.estado || 'Activo'
    };

    // Si estamos editando, incluir el ID del empleado
    if (this.isEdit && this.empleado?.idEmpleado) {
      empleadoData.idEmpleado = this.empleado.idEmpleado;
    }

    return empleadoData;
  }

  private marcarCamposComoTocados(): void {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control?.invalid) {
        control.markAsTouched();
      }
    });
  }

  cerrar(): void {
    this.visible = false;
    this.cancelar.emit();
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

  private mostrarError(mensaje: string): void {
    this.errorMessage = mensaje;
    this.mostrarNotificacion(mensaje, 'error');
  }

  // Getters para facilitar el acceso a los controles del formulario en la plantilla
  get dniControl() { return this.form.get('dni'); }
  get nombresControl() { return this.form.get('nombres'); }
  get apellidosControl() { return this.form.get('apellidos'); }
  get telefonoControl() { return this.form.get('telefono'); }
  get emailControl() { return this.form.get('email'); }
  get fechaNacimientoControl() { return this.form.get('fechaNacimiento'); }
  get fechaIngresoControl() { return this.form.get('fechaIngreso'); }
  get cargoControl() { return this.form.get('cargo'); }
} 