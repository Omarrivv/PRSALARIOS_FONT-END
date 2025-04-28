import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';
import { EmpleadoService } from '../../services/empleado.service';
import { CargoService } from '../../services/cargo.service';
import { SalarioService } from '../../services/salario.service';

interface RotacionData {
  ingresos: { [key: string]: number };
  salidas: { [key: string]: number };
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit, AfterViewInit {
  totalEmpleados = 0;
  totalPlanilla = 0;
  totalCargos = 0;
  empleadosActivos = 0;
  empleadosRecientes: any[] = [];

  constructor(
    private empleadoService: EmpleadoService,
    private cargoService: CargoService,
    private salarioService: SalarioService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngAfterViewInit(): void {
    this.inicializarGraficos();
  }

  private cargarDatos(): void {
    this.empleadoService.listar().subscribe(empleados => {
      this.totalEmpleados = empleados.length;
      this.empleadosActivos = empleados.filter(e => e.estado === 'Activo').length;
      this.empleadosRecientes = empleados
        .sort((a, b) => new Date(b.fechaIngreso).getTime() - new Date(a.fechaIngreso).getTime())
        .slice(0, 5);
    });

    this.cargoService.listar().subscribe(cargos => {
      this.totalCargos = cargos.length;
    });

    this.salarioService.listar().subscribe(salarios => {
      this.totalPlanilla = salarios.reduce((total, salario) => total + salario.totalBruto!, 0);
    });
  }

  private inicializarGraficos(): void {
    this.empleadoService.listar().subscribe(empleados => {
      const salaryRanges = this.calcularRangosSalarios(empleados);
      this.crearGraficoSalarios(salaryRanges);

      const employeesByCargo = this.calcularEmpleadosPorCargo(empleados);
      this.crearGraficoEmpleadosPorCargo(employeesByCargo);

      const hiringTrend = this.calcularTendenciaContrataciones(empleados);
      this.crearGraficoTendenciaContrataciones(hiringTrend);

      const ageDistribution = this.calcularDistribucionEdad(empleados);
      this.crearGraficoEdad(ageDistribution);

      const turnoverData = this.calcularRotacionPersonal(empleados);
      this.crearGraficoRotacion(turnoverData);

      const payrollCosts = this.calcularCostosPlanilla(empleados);
      this.crearGraficoCostosPlanilla(payrollCosts);
    });
  }

  private calcularRangosSalarios(empleados: any[]): { [key: string]: number } {
    const ranges = {
      '0-1500': 0,
      '1501-3000': 0,
      '3001-4500': 0,
      '4501+': 0
    };

    empleados.forEach(emp => {
      const salario = emp.salario?.totalBruto || 0;
      if (salario <= 1500) ranges['0-1500']++;
      else if (salario <= 3000) ranges['1501-3000']++;
      else if (salario <= 4500) ranges['3001-4500']++;
      else ranges['4501+']++;
    });

    return ranges;
  }

  private calcularEmpleadosPorCargo(empleados: any[]): { [key: string]: number } {
    return empleados.reduce((acc, emp) => {
      const cargo = emp.cargo?.nombreCargo || 'Sin Cargo';
      acc[cargo] = (acc[cargo] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  private calcularTendenciaContrataciones(empleados: any[]): { [key: string]: number } {
    const lastSixMonths = Array.from({length: 6}, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date.toLocaleString('es', { month: 'short', year: '2-digit' });
    }).reverse();

    const contrataciones: { [key: string]: number } = lastSixMonths.reduce((acc, month) => {
      acc[month] = 0;
      return acc;
    }, {} as { [key: string]: number });

    empleados.forEach(emp => {
      const fecha = new Date(emp.fechaIngreso);
      const key = fecha.toLocaleString('es', { month: 'short', year: '2-digit' });
      if (contrataciones.hasOwnProperty(key)) {
        contrataciones[key]++;
      }
    });

    return contrataciones;
  }

  private calcularDistribucionEdad(empleados: any[]): { [key: string]: number } {
    const ranges = {
      '18-25': 0,
      '26-35': 0,
      '36-45': 0,
      '46+': 0
    };

    empleados.forEach(emp => {
      const edad = this.calcularEdad(new Date(emp.fechaNacimiento));
      if (edad <= 25) ranges['18-25']++;
      else if (edad <= 35) ranges['26-35']++;
      else if (edad <= 45) ranges['36-45']++;
      else ranges['46+']++;
    });

    return ranges;
  }

  private calcularEdad(fechaNacimiento: Date): number {
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - fechaNacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  private calcularRotacionPersonal(empleados: any[]): RotacionData {
    const ultimos6Meses = Array.from({length: 6}, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date.toLocaleString('es', { month: 'short', year: '2-digit' });
    }).reverse();

    const rotacion: RotacionData = {
      ingresos: ultimos6Meses.reduce((acc, month) => ({ ...acc, [month]: 0 }), {}),
      salidas: ultimos6Meses.reduce((acc, month) => ({ ...acc, [month]: 0 }), {})
    };

    empleados.forEach(emp => {
      const fechaIngreso = new Date(emp.fechaIngreso);
      const key = fechaIngreso.toLocaleString('es', { month: 'short', year: '2-digit' });
      if (rotacion.ingresos.hasOwnProperty(key)) {
        rotacion.ingresos[key]++;
      }

      if (emp.fechaSalida) {
        const fechaSalida = new Date(emp.fechaSalida);
        const keySalida = fechaSalida.toLocaleString('es', { month: 'short', year: '2-digit' });
        if (rotacion.salidas.hasOwnProperty(keySalida)) {
          rotacion.salidas[keySalida]++;
        }
      }
    });

    return rotacion;
  }

  private calcularCostosPlanilla(empleados: any[]): { [key: string]: number } {
    return empleados.reduce((acc, emp) => {
      const area = emp.cargo?.area || 'Sin Área';
      const salario = emp.salario?.totalBruto || 0;
      acc[area] = (acc[area] || 0) + salario;
      return acc;
    }, {});
  }

  private crearGraficoSalarios(data: any): void {
    const chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: '#334155'
          },
          ticks: {
            color: '#94a3b8'
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#94a3b8'
          }
        }
      }
    };

    new Chart('salaryChart', {
      type: 'bar',
      data: {
        labels: Object.keys(data),
        datasets: [{
          label: 'Empleados',
          data: Object.values(data),
          backgroundColor: '#3b82f6',
          borderRadius: 8
        }]
      },
      options: chartOptions
    });
  }

  private crearGraficoEmpleadosPorCargo(data: any): void {
    new Chart('employeeChart', {
      type: 'doughnut',
      data: {
        labels: Object.keys(data),
        datasets: [{
          data: Object.values(data),
          backgroundColor: [
            '#3b82f6',
            '#10b981',
            '#8b5cf6',
            '#f59e0b',
            '#ef4444'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#94a3b8'
            }
          }
        }
      }
    });
  }

  private crearGraficoTendenciaContrataciones(data: any): void {
    const chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: '#334155'
          },
          ticks: {
            color: '#94a3b8'
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#94a3b8'
          }
        }
      }
    };

    new Chart('hiringChart', {
      type: 'line',
      data: {
        labels: Object.keys(data),
        datasets: [{
          label: 'Contrataciones',
          data: Object.values(data),
          borderColor: '#10b981',
          tension: 0.4,
          fill: true,
          backgroundColor: 'rgba(16, 185, 129, 0.1)'
        }]
      },
      options: chartOptions
    });
  }

  private crearGraficoEdad(data: any): void {
    new Chart('ageChart', {
      type: 'pie',
      data: {
        labels: Object.keys(data),
        datasets: [{
          data: Object.values(data),
          backgroundColor: [
            '#60a5fa',
            '#34d399',
            '#a78bfa',
            '#fbbf24'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#94a3b8' }
          }
        }
      }
    });
  }

  private crearGraficoRotacion(data: RotacionData): void {
    new Chart('turnoverChart', {
      type: 'line',
      data: {
        labels: Object.keys(data.ingresos),
        datasets: [
          {
            label: 'Ingresos',
            data: Object.values(data.ingresos),
            borderColor: '#34d399',
            tension: 0.4,
            fill: false
          },
          {
            label: 'Salidas',
            data: Object.values(data.salidas),
            borderColor: '#f87171',
            tension: 0.4,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
            labels: { color: '#94a3b8' }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#334155' },
            ticks: { color: '#94a3b8' }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8' }
          }
        }
      }
    });
  }

  private crearGraficoCostosPlanilla(data: any): void {
    new Chart('payrollCostChart', {
      type: 'bar',
      data: {
        labels: Object.keys(data),
        datasets: [{
          label: 'Costo Total',
          data: Object.values(data),
          backgroundColor: [
            '#3b82f6',
            '#10b981',
            '#8b5cf6',
            '#f59e0b',
            '#ef4444',
            '#06b6d4'
          ],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const value = context.raw;
                return `S/. ${value.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#334155' },
            ticks: {
              color: '#94a3b8',
              callback: (value: any) => `S/. ${value.toLocaleString('es-PE')}`
            }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8' }
          }
        }
      }
    });
  }
} 