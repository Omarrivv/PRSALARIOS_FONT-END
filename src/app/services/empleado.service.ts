import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { Empleado } from '../models/empleado.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmpleadoService {
  private apiUrl = `${environment.apiUrl}/api/empleados`;
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };
  private timeoutDuration = 10000;

  constructor(private http: HttpClient) {}

  listar(): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(this.apiUrl).pipe(
      timeout(this.timeoutDuration),
      catchError((error) => this.handleError(error))
    );
  }

  obtenerPorId(id: number): Observable<Empleado> {
    return this.http.get<Empleado>(`${this.apiUrl}/${id}`).pipe(
      timeout(this.timeoutDuration),
      catchError((error) => this.handleError(error))
    );
  }

  crear(empleado: any): Observable<Empleado> {
    try {
      const empleadoFormateado = this.formatearEmpleadoParaEnvio(empleado);
      console.log('Datos a enviar:', empleadoFormateado);
      
      return this.http.post<Empleado>(this.apiUrl, empleadoFormateado, this.httpOptions).pipe(
        timeout(this.timeoutDuration),
        catchError((error) => {
          console.error('Error en crear empleado:', error);
          
          if (error.status === 400) {
            return throwError(() => ({
              status: 400,
              message: error.error?.message || 'Error de validación: Los datos proporcionados no son válidos'
            }));
          } else if (error.status === 409) {
            return throwError(() => ({
              status: 409,
              message: 'Ya existe un empleado con ese DNI'
            }));
          } else if (error.status === 422) {
            return throwError(() => ({
              status: 422,
              message: error.error?.message || 'Error de validación: Los datos proporcionados no son válidos'
            }));
          }
          
          return this.handleError(error);
        })
      );
    } catch (error: any) {
      console.error('Error al formatear empleado:', error);
      return throwError(() => ({
        status: 400,
        message: error.message || 'Error al formatear los datos del empleado'
      }));
    }
  }

  actualizar(id: number, empleado: any): Observable<Empleado> {
    try {
      if (!id) {
        throw new Error('ID de empleado no válido');
      }

      const empleadoFormateado = this.formatearEmpleadoParaEnvio(empleado);
      console.log('Datos a actualizar:', empleadoFormateado);

      return this.http.put<Empleado>(`${this.apiUrl}/${id}`, empleadoFormateado, this.httpOptions).pipe(
        timeout(this.timeoutDuration),
        catchError((error) => {
          console.error('Error en actualizar empleado:', error);
          if (error.error?.message) {
            return throwError(() => ({
              status: error.status,
              message: error.error.message
            }));
          }
          return this.handleError(error);
        })
      );
    } catch (error: any) {
      console.error('Error al formatear empleado para actualización:', error);
      return throwError(() => ({
        status: 400,
        message: error.message || 'Error al formatear los datos del empleado'
      }));
    }
  }

  eliminar(id: number): Observable<void> {
    if (!id) {
      return throwError(() => ({
        status: 400,
        message: 'ID de empleado no válido'
      }));
    }

    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      timeout(this.timeoutDuration),
      map(() => {
        console.log(`Empleado con ID ${id} eliminado correctamente`);
        return;
      }),
      catchError((error) => {
        console.error('Error al eliminar empleado:', error);
        
        if (error.status === 404) {
          return throwError(() => ({
            status: 404,
            message: 'El empleado no existe o ya fue eliminado'
          }));
        }
        
        if (error.status === 409) {
          return throwError(() => ({
            status: 409,
            message: 'No se puede eliminar el empleado porque tiene registros asociados'
          }));
        }
        
        return this.handleError(error);
      })
    );
  }

  private formatearEmpleadoParaEnvio(empleado: any): any {
    if (!empleado) {
      throw new Error('No se proporcionaron datos del empleado');
    }

    try {
      const empleadoFormateado = { ...empleado };

      // Validar campos requeridos
      const camposRequeridos = ['dni', 'nombres', 'apellidos', 'cargo', 'fechaNacimiento', 'fechaIngreso'];
      const camposFaltantes = camposRequeridos.filter(campo => !empleadoFormateado[campo]);
      
      if (camposFaltantes.length > 0) {
        throw new Error(`Faltan campos requeridos: ${camposFaltantes.join(', ')}`);
      }

      // Validar formato de DNI
      if (!/^\d{8}$/.test(empleadoFormateado.dni)) {
        throw new Error('El DNI debe tener exactamente 8 dígitos numéricos');
      }

      // Validar formato de teléfono si existe
      if (empleadoFormateado.telefono && !/^\d{9}$/.test(empleadoFormateado.telefono)) {
        throw new Error('El teléfono debe tener exactamente 9 dígitos numéricos');
      }

      // Validar formato de email si existe
      if (empleadoFormateado.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(empleadoFormateado.email)) {
        throw new Error('El formato del email no es válido');
      }

      // Validar fechas
      const fechaNacimiento = new Date(empleadoFormateado.fechaNacimiento);
      const fechaIngreso = new Date(empleadoFormateado.fechaIngreso);
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

      // Validar cargo
      if (!empleadoFormateado.cargo || !empleadoFormateado.cargo.idCargo) {
        throw new Error('El cargo es requerido');
      }

      // Validar estado
      if (!['Activo', 'Inactivo'].includes(empleadoFormateado.estado)) {
        throw new Error('El estado debe ser Activo o Inactivo');
      }

      // Formatear fechas a ISO string
      empleadoFormateado.fechaNacimiento = fechaNacimiento.toISOString().split('T')[0];
      empleadoFormateado.fechaIngreso = fechaIngreso.toISOString().split('T')[0];

      return empleadoFormateado;
    } catch (error: any) {
      console.error('Error en formatearEmpleadoParaEnvio:', error);
      throw new Error(error.message || 'Error al formatear los datos del empleado');
    }
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error en la operación HTTP:', error);

    let errorMessage = 'Ha ocurrido un error en la operación';
    let status = error.status;

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'No se puede conectar con el servidor. Por favor, verifica tu conexión a internet.';
          break;
        case 400:
          errorMessage = error.error?.message || 'Los datos proporcionados no son válidos';
          break;
        case 401:
          errorMessage = 'No estás autorizado para realizar esta acción';
          break;
        case 403:
          errorMessage = 'No tienes permisos para realizar esta acción';
          break;
        case 404:
          errorMessage = 'El recurso solicitado no existe';
          break;
        case 409:
          errorMessage = 'Ya existe un empleado con estos datos';
          break;
        case 422:
          errorMessage = error.error?.message || 'Los datos proporcionados no son válidos';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Por favor, intenta más tarde';
          break;
        default:
          errorMessage = error.error?.message || 'Ha ocurrido un error inesperado';
      }
    }

    return throwError(() => ({
      status: status,
      message: errorMessage
    }));
  }
} 