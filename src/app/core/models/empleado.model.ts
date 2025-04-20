import { Cargo } from './cargo.model';

export interface Empleado {
  idEmpleado?: number;
  dni: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  fechaNacimiento: Date;
  fechaIngreso: Date;
  cargo: Cargo;
  estado: 'Activo' | 'Inactivo';
} 