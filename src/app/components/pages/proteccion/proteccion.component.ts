import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-proteccion',
  templateUrl: './proteccion.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class ProteccionComponent {
  loading = false;
  healthScore = 82;
  cobertura = 'Estándar';

  aplicarProteccion() {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      this.cobertura = 'Premium';
    }, 1500);
  }
}

