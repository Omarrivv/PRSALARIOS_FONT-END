import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface Usuario {
  email: string;
  password: string;
  nombre: string;
  rol: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usuarios: Usuario[] = [
    {
      email: 'omar.rivera@vallegrande.edu.pe',
      password: 'omar2068123true',
      nombre: 'Omar Rivera',
      rol: 'admin'
    },
    {
      email: 'ccencho@gmail.com',
      password: 'cencho123true879',
      nombre: 'Carlos Cencho',
      rol: 'admin'
    },
    {
      email: 'maria@example.com',
      password: 'maria123true',
      nombre: 'María García',
      rol: 'usuario'
    }
  ];

  private usuarioActualSubject = new BehaviorSubject<Usuario | null>(this.getUsuarioGuardado());
  usuarioActual$ = this.usuarioActualSubject.asObservable();

  constructor(private router: Router) {
    // Verificar autenticación al iniciar
    if (this.isAuthenticated()) {
      this.usuarioActualSubject.next(this.getUsuarioGuardado());
    }
  }

  login(email: string, password: string): Observable<Usuario> {
    const usuario = this.usuarios.find(u => u.email === email && u.password === password);

    if (usuario) {
      return of(usuario).pipe(
        delay(1000),
        tap(user => {
          this.guardarUsuario(user);
          this.usuarioActualSubject.next(user);
          this.router.navigate(['/empleados']);
        })
      );
    }

    return throwError(() => new Error('Credenciales inválidas'));
  }

  logout(): void {
    localStorage.removeItem('usuario');
    this.usuarioActualSubject.next(null);
    this.router.navigate(['/login']);
  }

  private guardarUsuario(usuario: Usuario): void {
    localStorage.setItem('usuario', JSON.stringify(usuario));
  }

  private getUsuarioGuardado(): Usuario | null {
    const usuarioStr = localStorage.getItem('usuario');
    return usuarioStr ? JSON.parse(usuarioStr) : null;
  }

  isAuthenticated(): boolean {
    return this.usuarioActualSubject.value !== null;
  }
} 