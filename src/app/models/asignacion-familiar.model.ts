import { Empleado } from './empleado.model';

export interface AsignacionFamiliar {
    idAsignacion?: number;
    empleado: {
        idEmpleado: number;
        nombres: string;
        apellidos: string;
        cargo: {
            nombreCargo: string;
        };
    };
    cantidadHijos: number;
    montoAsignacion?: number;
} 