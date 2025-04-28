import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notificacion {
  id: number;
  tipo: 'info' | 'success' | 'warning';
  mensaje: string;
  tiempo: string;
  leida: boolean;
  icono: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private notificaciones = new BehaviorSubject<Notificacion[]>([]);
  private contador = 0;

  constructor() {
    // Inicializar con algunas notificaciones de ejemplo
    this.agregarNotificacion({
      tipo: 'success',
      mensaje: 'Nuevo empleado registrado: Ana García',
      icono: 'fas fa-user-plus'
    });

    this.agregarNotificacion({
      tipo: 'info',
      mensaje: 'Actualización de salario procesada para Juan Pérez',
      icono: 'fas fa-money-bill-wave'
    });

    this.agregarNotificacion({
      tipo: 'warning',
      mensaje: 'Recordatorio: Cierre de planilla en 2 días',
      icono: 'fas fa-clock'
    });
  }

  getNotificaciones(): Observable<Notificacion[]> {
    return this.notificaciones.asObservable();
  }

  agregarNotificacion(data: Omit<Notificacion, 'id' | 'tiempo' | 'leida'>): void {
    const nuevaNotificacion: Notificacion = {
      id: ++this.contador,
      ...data,
      tiempo: 'Ahora',
      leida: false
    };

    const notificacionesActuales = this.notificaciones.value;
    this.notificaciones.next([nuevaNotificacion, ...notificacionesActuales]);

    // Actualizar los tiempos relativos cada minuto
    this.actualizarTiempos();
  }

  marcarComoLeida(id: number): void {
    const notificacionesActuales = this.notificaciones.value;
    const notificacionesActualizadas = notificacionesActuales.map(n => 
      n.id === id ? { ...n, leida: true } : n
    );
    this.notificaciones.next(notificacionesActualizadas);
  }

  marcarTodasComoLeidas(): void {
    const notificacionesActuales = this.notificaciones.value;
    const notificacionesActualizadas = notificacionesActuales.map(n => 
      ({ ...n, leida: true })
    );
    this.notificaciones.next(notificacionesActualizadas);
  }

  eliminarNotificacion(id: number): void {
    const notificacionesActuales = this.notificaciones.value;
    const notificacionesActualizadas = notificacionesActuales.filter(n => n.id !== id);
    this.notificaciones.next(notificacionesActualizadas);
  }

  private actualizarTiempos(): void {
    setInterval(() => {
      const notificacionesActuales = this.notificaciones.value;
      const notificacionesActualizadas = notificacionesActuales.map(n => ({
        ...n,
        tiempo: this.calcularTiempoRelativo(n.id)
      }));
      this.notificaciones.next(notificacionesActualizadas);
    }, 60000); // Actualizar cada minuto
  }

  private calcularTiempoRelativo(id: number): string {
    const minutos = (this.contador - id) + 1;
    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return `Hace ${minutos} minutos`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `Hace ${horas} horas`;
    const dias = Math.floor(horas / 24);
    return `Hace ${dias} días`;
  }
} 