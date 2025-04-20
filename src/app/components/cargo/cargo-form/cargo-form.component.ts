import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CargoService } from '../../../services/cargo.service';
import { Cargo } from '../../../models/cargo.model';

@Component({
  selector: 'app-cargo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cargo-form.component.html',
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
      max-width: 500px;
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
export class CargoFormComponent implements OnInit {
  @Input() cargo?: Cargo;
  @Output() guardarCargo = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  form: FormGroup;
  visible = true;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private cargoService: CargoService
  ) {
    this.form = this.fb.group({
      nombreCargo: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', Validators.maxLength(500)]
    });
  }

  ngOnInit(): void {
    if (this.cargo) {
      this.isEdit = true;
      this.form.patchValue(this.cargo);
    }
  }

  guardar(): void {
    if (this.form.valid) {
      const cargo = this.form.value;
      const operacion = this.isEdit ?
        this.cargoService.actualizar(this.cargo!.idCargo, cargo) :
        this.cargoService.crear(cargo);

      operacion.subscribe({
        next: () => {
          this.mostrarNotificacion(
            this.isEdit ? 'Cargo actualizado correctamente' : 'Cargo creado correctamente'
          );
          this.guardarCargo.emit();
          this.cerrar();
        },
        error: () => this.mostrarNotificacion('Error al guardar el cargo')
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