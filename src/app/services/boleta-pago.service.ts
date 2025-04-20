import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BoletaPago } from '../models/boleta-pago.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BoletaPagoService {
  private apiUrl = `${environment.apiUrl}/api/boletas-pago`;

  constructor(private http: HttpClient) {}

  listar(): Observable<BoletaPago[]> {
    return this.http.get<BoletaPago[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<BoletaPago> {
    return this.http.get<BoletaPago>(`${this.apiUrl}/${id}`);
  }

  buscarPorEmpleado(idEmpleado: number): Observable<BoletaPago[]> {
    return this.http.get<BoletaPago[]>(`${this.apiUrl}/empleado/${idEmpleado}`);
  }

  buscarPorPeriodo(fechaInicio: Date, fechaFin: Date): Observable<BoletaPago[]> {
    return this.http.get<BoletaPago[]>(`${this.apiUrl}/periodo`, {
      params: {
        fechaInicio: fechaInicio.toISOString().split('T')[0],
        fechaFin: fechaFin.toISOString().split('T')[0]
      }
    });
  }

  buscarPorEmpleadoYFecha(idEmpleado: number, fechaEmision: Date): Observable<BoletaPago> {
    const fecha = fechaEmision.toISOString().split('T')[0];
    return this.http.get<BoletaPago>(`${this.apiUrl}/empleado/${idEmpleado}/fecha/${fecha}`);
  }

  crear(boleta: BoletaPago): Observable<BoletaPago> {
    return this.http.post<BoletaPago>(this.apiUrl, boleta);
  }

  actualizar(id: number, boleta: BoletaPago): Observable<BoletaPago> {
    return this.http.put<BoletaPago>(`${this.apiUrl}/${id}`, boleta);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 