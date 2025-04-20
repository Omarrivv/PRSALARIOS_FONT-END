import { Empleado } from './empleado.model';

export interface Descuento {
    idDescuento?: number;
    empleado: Empleado;
    afp: number;
    onp: number;
    essalud: number;
    impuestoRenta: number;
    totalDescuento?: number;
} 