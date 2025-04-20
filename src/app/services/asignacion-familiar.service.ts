import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AsignacionFamiliar } from '../models/asignacion-familiar.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AsignacionFamiliarService {
  private apiUrl = `${environment.apiUrl}/api/asignaciones-familiares`;

  constructor(private http: HttpClient) { }

  listar(): Observable<AsignacionFamiliar[]> {
    return this.http.get<AsignacionFamiliar[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<AsignacionFamiliar> {
    return this.http.get<AsignacionFamiliar>(`${this.apiUrl}/${id}`);
  }

  buscarPorEmpleado(idEmpleado: number): Observable<AsignacionFamiliar> {
    return this.http.get<AsignacionFamiliar>(`${this.apiUrl}/empleado/${idEmpleado}`);
  }

  crear(asignacion: AsignacionFamiliar): Observable<AsignacionFamiliar> {
    return this.http.post<AsignacionFamiliar>(this.apiUrl, asignacion);
  }

  actualizar(id: number, asignacion: AsignacionFamiliar): Observable<AsignacionFamiliar> {
    return this.http.put<AsignacionFamiliar>(`${this.apiUrl}/${id}`, asignacion);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 