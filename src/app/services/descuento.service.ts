import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Descuento } from '../models/descuento.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DescuentoService {
  private apiUrl = `${environment.apiUrl}/api/descuentos`;

  constructor(private http: HttpClient) { }

  listar(): Observable<Descuento[]> {
    return this.http.get<Descuento[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<Descuento> {
    return this.http.get<Descuento>(`${this.apiUrl}/${id}`);
  }

  buscarPorEmpleado(idEmpleado: number): Observable<Descuento> {
    return this.http.get<Descuento>(`${this.apiUrl}/empleado/${idEmpleado}`);
  }

  crear(descuento: Descuento): Observable<Descuento> {
    return this.http.post<Descuento>(this.apiUrl, descuento);
  }

  actualizar(id: number, descuento: Descuento): Observable<Descuento> {
    return this.http.put<Descuento>(`${this.apiUrl}/${id}`, descuento);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 