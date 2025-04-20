import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Salario } from '../models/salario.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SalarioService {
  private apiUrl = `${environment.apiUrl}/api/salarios`;

  constructor(private http: HttpClient) { }

  listar(): Observable<Salario[]> {
    return this.http.get<Salario[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<Salario> {
    return this.http.get<Salario>(`${this.apiUrl}/${id}`);
  }

  buscarPorEmpleado(idEmpleado: number): Observable<Salario[]> {
    return this.http.get<Salario[]>(`${this.apiUrl}/empleado/${idEmpleado}`);
  }

  crear(salario: Salario): Observable<Salario> {
    return this.http.post<Salario>(this.apiUrl, salario);
  }

  actualizar(id: number, salario: Salario): Observable<Salario> {
    return this.http.put<Salario>(`${this.apiUrl}/${id}`, salario);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 