import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cargo } from '../models/cargo.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CargoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/cargos`;

  listar(): Observable<Cargo[]> {
    return this.http.get<Cargo[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Cargo> {
    return this.http.get<Cargo>(`${this.apiUrl}/${id}`);
  }

  guardar(cargo: Cargo): Observable<Cargo> {
    return this.http.post<Cargo>(this.apiUrl, cargo);
  }

  actualizar(id: number, cargo: Cargo): Observable<Cargo> {
    return this.http.put<Cargo>(`${this.apiUrl}/${id}`, cargo);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 