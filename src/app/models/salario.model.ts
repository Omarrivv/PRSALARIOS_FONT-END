import { Empleado } from './empleado.model';

export interface Salario {
    idSalario?: number;
    empleado: Empleado;
    sueldoBase: number;
    horasExtra: number;
    bonificaciones: number;
    totalBruto?: number;
} 