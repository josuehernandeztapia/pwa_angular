import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, LogIn } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <!-- Logo/Brand -->
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-50">Conductores PWA</h1>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Plataforma fintech para movilidad
          </p>
        </div>

        <!-- Login Form -->
        <div class="ui-card">
          <div class="ui-card-body">
            <form class="space-y-6" (ngSubmit)="onSubmit()">
              <div>
                <label for="email" class="ui-label">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  class="ui-input"
                  placeholder="tu@correo.com"
                  [(ngModel)]="email"
                />
              </div>

              <div>
                <label for="password" class="ui-label">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  class="ui-input"
                  placeholder="••••••••"
                  [(ngModel)]="password"
                />
              </div>

              <button
                type="submit"
                class="ui-btn-primary w-full"
                [disabled]="isLoading"
              >
                <lucide-angular
                  [img]="logInIcon"
                  class="w-4 h-4"
                  *ngIf="!isLoading"
                ></lucide-angular>
                <span class="ui-spinner w-4 h-4" *ngIf="isLoading"></span>
                {{isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}}
              </button>
            </form>
          </div>
        </div>

        <!-- Footer -->
        <div class="text-center">
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Versión demo - PR#1 Infraestructura
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  isLoading = false;

  // Lucide icons
  readonly logInIcon = LogIn;

  constructor(private router: Router) {}

  async onSubmit() {
    this.isLoading = true;

    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Navigate to dashboard (for demo)
    this.router.navigate(['/dashboard']);

    this.isLoading = false;
  }
}