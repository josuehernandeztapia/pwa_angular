import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.scss']
})
export class ConfiguracionComponent {
  modo: 'cotizador' | 'simulador' = 'cotizador';

  paquetes: Array<{ nombre: string; precio: string; features: string[] }> = [
    { nombre: 'Básico', precio: '$1000', features: ['Hasta 3 flujos', 'Soporte básico', 'Reportes simples'] },
    { nombre: 'Premium', precio: '$2500', features: ['Flujos ilimitados', 'Soporte prioritario', 'Analítica avanzada'] }
  ];

  form = new FormGroup({
    nombre: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
    tipo: new FormControl<string>('', { validators: [Validators.required], nonNullable: true })
  });

  setModo(m: 'cotizador' | 'simulador'): void {
    this.modo = m;
  }
}