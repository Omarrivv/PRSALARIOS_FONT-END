import { Empleado } from './empleado.model';
import { Salario } from './salario.model';
import { Descuento } from './descuento.model';
import { AsignacionFamiliar } from './asignacion-familiar.model';

export interface BoletaPago {
    idBoleta?: number;
    empleado: Empleado;
    fechaEmision: Date;
    salario: Salario;
    descuento: Descuento;
    asignacionFamiliar: AsignacionFamiliar;
    totalNeto: number;
} 