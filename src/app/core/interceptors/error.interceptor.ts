import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Ha ocurrido un error';

        if (error.error instanceof ErrorEvent) {
          // Error del lado del cliente
          errorMessage = `Error del cliente: ${error.error.message}`;
          console.error('Error del cliente:', error.error);
        } else {
          // Error del lado del servidor
          console.error(
            `Código de error ${error.status}, ` +
            `mensaje: ${error.error?.message || error.message}`
          );

          switch (error.status) {
            case 0:
              errorMessage = 'No se puede conectar con el servidor. Por favor, verifica tu conexión a internet.';
              break;
            case 400:
              errorMessage = this.handleBadRequest(error);
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
              errorMessage = 'El registro ya existe o hay un conflicto con los datos';
              break;
            case 422:
              errorMessage = this.handleValidationError(error);
              break;
            case 500:
              errorMessage = 'Error interno del servidor. Por favor, intenta más tarde';
              break;
            default:
              errorMessage = 'Ha ocurrido un error inesperado';
              break;
          }
        }

        this.mostrarNotificacion(errorMessage, 'error');
        return throwError(() => error);
      })
    );
  }

  private handleBadRequest(error: HttpErrorResponse): string {
    if (error.error?.message) {
      return error.error.message;
    }

    if (error.error?.errors) {
      const errores = Object.values(error.error.errors);
      if (errores.length > 0) {
        return errores.join('. ');
      }
    }

    return 'Los datos proporcionados no son válidos';
  }

  private handleValidationError(error: HttpErrorResponse): string {
    if (error.error?.message) {
      return error.error.message;
    }

    if (error.error?.errors) {
      const errores = Object.values(error.error.errors);
      if (errores.length > 0) {
        return errores.join('. ');
      }
    }

    return 'Error de validación en los datos enviados';
  }

  private mostrarNotificacion(mensaje: string, tipo: 'error'): void {
    console.error('Error interceptado:', mensaje);
    
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion ${tipo}`;
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);

    setTimeout(() => {
      notificacion.remove();
    }, 5000); // Aumentado a 5 segundos para dar más tiempo de lectura
  }
} 