import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CargoService } from '../../../core/services/cargo.service';
import { Cargo } from '../../../core/models/cargo.model';
import { CargoFormComponent } from '../../../components/cargo/cargo-form/cargo-form.component';
@Component({
  selector: 'app-cargo-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="container">
      <div class="header">
        <h2>Lista de Cargos</h2>
        <button mat-raised-button color="primary" (click)="abrirDialogo()">
          <mat-icon>add</mat-icon>
          Nuevo Cargo
        </button>
      </div>

      <table mat-table [dataSource]="cargos" class="mat-elevation-z8">
        <ng-container matColumnDef="nombreCargo">
          <th mat-header-cell *matHeaderCellDef>Nombre del Cargo</th>
          <td mat-cell *matCellDef="let cargo">{{cargo.nombreCargo}}</td>
        </ng-container>

        <ng-container matColumnDef="descripcion">
          <th mat-header-cell *matHeaderCellDef>Descripción</th>
          <td mat-cell *matCellDef="let cargo">{{cargo.descripcion}}</td>
        </ng-container>

        <ng-container matColumnDef="acciones">
          <th mat-header-cell *matHeaderCellDef>Acciones</th>
          <td mat-cell *matCellDef="let cargo">
            <button mat-icon-button color="primary" (click)="editar(cargo)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="eliminar(cargo)">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="columnas"></tr>
        <tr mat-row *matRowDef="let row; columns: columnas;"></tr>
      </table>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
    }
  `]
})
export class CargoListComponent {
  private dialog = inject(MatDialog);
  private cargoService = inject(CargoService);
  private snackBar = inject(MatSnackBar);

  cargos: Cargo[] = [];
  columnas = ['nombreCargo', 'descripcion', 'acciones'];

  constructor() {
    this.cargarCargos();
  }

  cargarCargos(): void {
    this.cargoService.listar().subscribe({
      next: (cargos: Cargo[]) => this.cargos = cargos,
      error: () => this.mostrarError('Error al cargar los cargos')
    });
  }

  abrirDialogo(cargo?: Cargo): void {
    const dialogRef = this.dialog.open(CargoFormComponent, {
      width: '500px',
      data: { cargo }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarCargos();
      }
    });
  }

  editar(cargo: Cargo): void {
    this.abrirDialogo(cargo);
  }

  eliminar(cargo: Cargo): void {
    if (!cargo.idCargo) return;
    
    if (confirm('¿Está seguro de eliminar este cargo?')) {
      this.cargoService.eliminar(cargo.idCargo).subscribe({
        next: () => {
          this.mostrarMensaje('Cargo eliminado correctamente');
          this.cargarCargos();
        },
        error: () => this.mostrarError('Error al eliminar el cargo')
      });
    }
  }

  private mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  private mostrarError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }
} 