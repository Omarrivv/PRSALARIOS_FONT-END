import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-box">
        <div class="login-header">
          <h1>PR Salarios</h1>
          <p>Sistema de Gestión de Planilla</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <div class="form-group">
            <label for="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              [class.invalid]="emailControl?.invalid && emailControl?.touched"
              placeholder="ejemplo@correo.com"
            >
            <div class="validation-message" *ngIf="emailControl?.invalid && emailControl?.touched">
              <span *ngIf="emailControl?.errors?.['required']">El correo es requerido</span>
              <span *ngIf="emailControl?.errors?.['email']">Ingrese un correo válido</span>
            </div>
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              [class.invalid]="passwordControl?.invalid && passwordControl?.touched"
              placeholder="••••••••"
            >
            <div class="validation-message" *ngIf="passwordControl?.invalid && passwordControl?.touched">
              <span *ngIf="passwordControl?.errors?.['required']">La contraseña es requerida</span>
              <span *ngIf="passwordControl?.errors?.['minlength']">La contraseña debe tener al menos 6 caracteres</span>
            </div>
          </div>

          <button type="submit" [disabled]="loginForm.invalid || isLoading" class="login-button">
            <span *ngIf="!isLoading">Iniciar Sesión</span>
            <span *ngIf="isLoading" class="loading-text">
              <i class="fas fa-spinner fa-spin"></i>
              Iniciando sesión...
            </span>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      padding: 20px;
    }

    .login-box {
      background: white;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 2rem;
      width: 100%;
      max-width: 400px;
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .login-header h1 {
      color: #1e3c72;
      margin: 0;
      font-size: 2rem;
      font-weight: 700;
    }

    .login-header p {
      color: #666;
      margin-top: 0.5rem;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    label {
      color: #333;
      font-weight: 500;
      font-size: 0.9rem;
    }

    input {
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }

    input:focus {
      outline: none;
      border-color: #1e3c72;
      box-shadow: 0 0 0 2px rgba(30, 60, 114, 0.1);
    }

    input.invalid {
      border-color: #dc3545;
    }

    .validation-message {
      color: #dc3545;
      font-size: 0.8rem;
      margin-top: 0.25rem;
    }

    .error-message {
      background-color: #fff3f3;
      color: #dc3545;
      padding: 0.75rem;
      border-radius: 5px;
      border: 1px solid #ffcdd2;
      margin-bottom: 1rem;
    }

    .login-button {
      background: #1e3c72;
      color: white;
      border: none;
      padding: 0.75rem;
      border-radius: 5px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .login-button:hover:not(:disabled) {
      background: #2a5298;
    }

    .login-button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    @media (max-width: 480px) {
      .login-box {
        padding: 1.5rem;
      }

      .login-header h1 {
        font-size: 1.75rem;
      }
    }

    .loading-text {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .loading-text i {
      font-size: 1rem;
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Si ya está autenticado, redirigir a empleados
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/empleados']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      error: (error) => {
        this.errorMessage = error.message || 'Error al iniciar sesión';
        this.isLoading = false;
      }
    });
  }

  get emailControl() { return this.loginForm.get('email'); }
  get passwordControl() { return this.loginForm.get('password'); }
} 