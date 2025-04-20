import { Cargo } from './cargo.model';

export interface Empleado {
    idEmpleado: number;
    dni: string;
    nombres: string;
    apellidos: string;
    fechaNacimiento: string;
    telefono?: string;
    email?: string;
    direccion?: string;
    fechaIngreso: string;
    cargo: Cargo;
    estado: 'Activo' | 'Inactivo';
} 