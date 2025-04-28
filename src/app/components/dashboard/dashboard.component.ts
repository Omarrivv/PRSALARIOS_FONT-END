import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, Usuario } from '../../services/auth.service';
import { NotificacionService, Notificacion } from '../../services/notificacion.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h1>PR Salarios</h1>
          <button class="collapse-btn" (click)="toggleSidebar()">
            <i class="fas fa-chevron-left"></i>
          </button>
        </div>

        <div class="user-profile">
          <div class="avatar">
            <i class="fas fa-user"></i>
          </div>
          <div class="user-info">
            <h3>{{ usuario?.nombre }}</h3>
            <span class="role">{{ usuario?.rol === 'admin' ? 'Administrador' : 'Usuario' }}</span>
          </div>
        </div>

        <nav class="nav-menu">
          <a routerLink="/inicio" routerLinkActive="active" class="nav-item">
            <i class="fas fa-home"></i>
            <span>Inicio</span>
          </a>
          <a routerLink="/empleados" routerLinkActive="active" class="nav-item">
            <i class="fas fa-users"></i>
            <span>Empleados</span>
          </a>
          <a routerLink="/cargos" routerLinkActive="active" class="nav-item">
            <i class="fas fa-briefcase"></i>
            <span>Cargos</span>
          </a>
          <a routerLink="/salarios" routerLinkActive="active" class="nav-item">
            <i class="fas fa-money-bill-wave"></i>
            <span>Salarios</span>
          </a>
          <a routerLink="/descuentos" routerLinkActive="active" class="nav-item">
            <i class="fas fa-percentage"></i>
            <span>Descuentos</span>
          </a>
          <a routerLink="/asignaciones" routerLinkActive="active" class="nav-item">
            <i class="fas fa-users-family"></i>
            <span>Asignaciones</span>
          </a>
          <a routerLink="/boletas" routerLinkActive="active" class="nav-item">
            <i class="fas fa-file-invoice-dollar"></i>
            <span>Boletas de Pago</span>
          </a>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <header class="main-header">
          <h2>Sistema de Gestión de Planilla</h2>
          <div class="header-actions">
            <div class="search-box">
              <i class="fas fa-search"></i>
              <input type="text" placeholder="Buscar...">
            </div>
            <div class="user-menu">
              <div class="notification-center" [class.active]="mostrarNotificaciones">
                <button class="notification-btn" (click)="toggleNotificaciones()">
                  <i class="fas fa-bell"></i>
                  <span class="badge" *ngIf="notificacionesNoLeidas > 0">{{notificacionesNoLeidas}}</span>
                </button>
                <div class="notification-panel" *ngIf="mostrarNotificaciones">
                  <div class="notification-header">
                    <h3>Notificaciones</h3>
                    <button class="mark-all-read" (click)="marcarTodasComoLeidas()">
                      Marcar todas como leídas
                    </button>
                  </div>
                  <div class="notification-list">
                    <div *ngFor="let notif of notificaciones" 
                         class="notification-item"
                         [class.unread]="!notif.leida"
                         (click)="marcarComoLeida(notif)">
                      <div class="notification-icon" [class]="notif.tipo">
                        <i [class]="notif.icono"></i>
                      </div>
                      <div class="notification-content">
                        <p class="notification-message">{{notif.mensaje}}</p>
                        <span class="notification-time">{{notif.tiempo}}</span>
                      </div>
                      <button class="notification-close" (click)="eliminarNotificacion(notif, $event)">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                    <div *ngIf="notificaciones.length === 0" class="no-notifications">
                      No hay notificaciones nuevas
                    </div>
                  </div>
                </div>
              </div>
              <span class="user-name">{{ usuario?.nombre }}</span>
              <button class="logout-btn" (click)="logout()">
                <i class="fas fa-sign-out-alt"></i>
              </button>
            </div>
          </div>
        </header>

        <div class="content">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      min-height: 100vh;
      background-color: #0f172a;
    }

    /* Sidebar Styles */
    .sidebar {
      width: 260px;
      background: linear-gradient(180deg, #1e293b, #0f172a);
      color: #e2e8f0;
      display: flex;
      flex-direction: column;
      box-shadow: 4px 0 15px rgba(0, 0, 0, 0.3);
      border-right: 1px solid rgba(255, 255, 255, 0.1);
    }

    .sidebar-header {
      padding: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(30, 41, 59, 0.5);
    }

    .sidebar-header h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      background: linear-gradient(135deg, #60a5fa, #3b82f6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .collapse-btn {
      background: transparent;
      border: none;
      color: #e2e8f0;
      cursor: pointer;
      padding: 0.5rem;
      opacity: 0.7;
      transition: all 0.3s ease;
    }

    .collapse-btn:hover {
      opacity: 1;
      transform: scale(1.1);
    }

    .user-profile {
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(30, 41, 59, 0.3);
    }

    .avatar {
      width: 45px;
      height: 45px;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
    }

    .avatar i {
      font-size: 1.5rem;
      color: #ffffff;
    }

    .user-info h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 500;
      color: #f1f5f9;
    }

    .user-info .role {
      font-size: 0.8rem;
      color: #94a3b8;
    }

    .nav-menu {
      padding: 1rem 0;
      display: flex;
      flex-direction: column;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.8rem 1.5rem;
      color: #e2e8f0;
      text-decoration: none;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .nav-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 4px;
      background: #3b82f6;
      transform: scaleY(0);
      transition: transform 0.3s ease;
    }

    .nav-item:hover {
      background: rgba(59, 130, 246, 0.1);
    }

    .nav-item:hover::before {
      transform: scaleY(1);
    }

    .nav-item.active {
      background: rgba(59, 130, 246, 0.15);
    }

    .nav-item.active::before {
      transform: scaleY(1);
    }

    .nav-item i {
      font-size: 1.2rem;
      width: 1.5rem;
      color: #60a5fa;
      transition: transform 0.3s ease;
    }

    .nav-item:hover i {
      transform: scale(1.1);
    }

    /* Main Content Styles */
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .main-header {
      background: #1e293b;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .main-header h2 {
      margin: 0;
      font-size: 1.25rem;
      color: #f1f5f9;
      font-weight: 500;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(30, 41, 59, 0.7);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      width: 300px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
    }

    .search-box:focus-within {
      border-color: #3b82f6;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
    }

    .search-box input {
      border: none;
      background: transparent;
      width: 100%;
      outline: none;
      font-size: 0.9rem;
      color: #e2e8f0;
    }

    .search-box input::placeholder {
      color: #94a3b8;
    }

    .search-box i {
      color: #94a3b8;
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .notification-center {
      position: relative;
    }

    .notification-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      padding: 0.5rem;
      transition: all 0.3s ease;
      position: relative;
    }

    .notification-btn:hover {
      color: #e2e8f0;
      transform: scale(1.1);
    }

    .notification-panel {
      position: absolute;
      top: 100%;
      right: 0;
      width: 360px;
      background: linear-gradient(145deg, #1e293b, #1a1f2e);
      border-radius: 12px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 1000;
      margin-top: 1rem;
      overflow: hidden;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .notification-header {
      padding: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(30, 41, 59, 0.5);
    }

    .notification-header h3 {
      margin: 0;
      color: #f1f5f9;
      font-size: 1rem;
      font-weight: 500;
    }

    .mark-all-read {
      background: transparent;
      border: none;
      color: #60a5fa;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .mark-all-read:hover {
      color: #3b82f6;
      text-decoration: underline;
    }

    .notification-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .notification-item {
      padding: 1rem;
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      transition: all 0.3s ease;
      cursor: pointer;
      position: relative;
    }

    .notification-item:hover {
      background: rgba(59, 130, 246, 0.1);
    }

    .notification-item.unread {
      background: rgba(59, 130, 246, 0.05);
    }

    .notification-item.unread::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: #3b82f6;
    }

    .notification-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .notification-icon.success {
      background: rgba(16, 185, 129, 0.2);
      color: #34d399;
    }

    .notification-icon.warning {
      background: rgba(245, 158, 11, 0.2);
      color: #fbbf24;
    }

    .notification-icon.info {
      background: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
    }

    .notification-icon i {
      font-size: 1.25rem;
    }

    .notification-content {
      flex: 1;
    }

    .notification-message {
      margin: 0;
      color: #e2e8f0;
      font-size: 0.875rem;
      line-height: 1.4;
    }

    .notification-time {
      display: block;
      color: #94a3b8;
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }

    .notification-close {
      background: transparent;
      border: none;
      color: #94a3b8;
      padding: 0.25rem;
      cursor: pointer;
      opacity: 0;
      transition: all 0.3s ease;
    }

    .notification-item:hover .notification-close {
      opacity: 1;
    }

    .notification-close:hover {
      color: #ef4444;
      transform: scale(1.1);
    }

    .no-notifications {
      padding: 2rem;
      text-align: center;
      color: #94a3b8;
      font-size: 0.875rem;
    }

    .badge {
      position: absolute;
      top: -5px;
      right: -5px;
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
      font-size: 0.7rem;
      padding: 0.2rem 0.4rem;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
      box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
      }
    }

    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        left: -260px;
        top: 0;
        bottom: 0;
        transition: left 0.3s ease;
        z-index: 1000;
      }

      .sidebar.show {
        left: 0;
      }

      .search-box {
        display: none;
      }

      .user-name {
        display: none;
      }

      .main-header {
        padding: 1rem;
      }

      .content {
        padding: 1rem;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  usuario: Usuario | null = null;
  isSidebarCollapsed = false;
  mostrarNotificaciones = false;
  notificaciones: Notificacion[] = [];
  private notificacionesSub?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificacionService: NotificacionService
  ) {}

  ngOnInit(): void {
    this.authService.usuarioActual$.subscribe(
      usuario => this.usuario = usuario
    );

    this.notificacionesSub = this.notificacionService.getNotificaciones()
      .subscribe(notificaciones => {
        this.notificaciones = notificaciones;
      });
  }

  ngOnDestroy(): void {
    if (this.notificacionesSub) {
      this.notificacionesSub.unsubscribe();
    }
  }

  get notificacionesNoLeidas(): number {
    return this.notificaciones.filter(n => !n.leida).length;
  }

  toggleNotificaciones(): void {
    this.mostrarNotificaciones = !this.mostrarNotificaciones;
  }

  marcarComoLeida(notificacion: Notificacion): void {
    this.notificacionService.marcarComoLeida(notificacion.id);
  }

  marcarTodasComoLeidas(): void {
    this.notificacionService.marcarTodasComoLeidas();
  }

  eliminarNotificacion(notificacion: Notificacion, event: Event): void {
    event.stopPropagation();
    this.notificacionService.eliminarNotificacion(notificacion.id);
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    document.querySelector('.sidebar')?.classList.toggle('show');
  }

  logout(): void {
    this.authService.logout();
  }
} 