import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Home, Settings, LogOut, Sun, Moon } from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
      <!-- Top Bar -->
      <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <!-- Logo -->
            <div class="flex items-center gap-3">
              <lucide-angular [img]="homeIcon" class="w-6 h-6 text-primary-600"></lucide-angular>
              <h1 class="text-lg font-semibold text-gray-900 dark:text-gray-50">
                Conductores PWA
              </h1>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-3">
              <!-- Dark Mode Toggle -->
              <button
                type="button"
                class="ui-btn-ghost"
                (click)="toggleDarkMode()"
                [title]="isDarkMode ? 'Activar modo claro' : 'Activar modo oscuro'"
              >
                <lucide-angular
                  [img]="isDarkMode ? sunIcon : moonIcon"
                  class="w-4 h-4"
                ></lucide-angular>
              </button>

              <!-- Settings -->
              <button type="button" class="ui-btn-ghost">
                <lucide-angular [img]="settingsIcon" class="w-4 h-4"></lucide-angular>
              </button>

              <!-- Logout -->
              <button
                type="button"
                class="ui-btn-secondary"
                (click)="logout()"
              >
                <lucide-angular [img]="logOutIcon" class="w-4 h-4"></lucide-angular>
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Welcome Section -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2">
            Bienvenido a Conductores PWA
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            Plataforma fintech para movilidad - OpenAI Style Dashboard
          </p>
        </div>

        <!-- Stats Cards -->
        <div class="ui-grid-cols-3 mb-8">
          <div class="ui-card-hover">
            <div class="ui-card-body">
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Total Clientes
              </h3>
              <p class="text-2xl font-bold text-gray-900 dark:text-gray-50">
                1,247
              </p>
              <p class="text-sm text-success-600 dark:text-success-400 mt-1">
                +12% vs mes anterior
              </p>
            </div>
          </div>

          <div class="ui-card-hover">
            <div class="ui-card-body">
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Cotizaciones
              </h3>
              <p class="text-2xl font-bold text-gray-900 dark:text-gray-50">
                342
              </p>
              <p class="text-sm text-primary-600 dark:text-primary-400 mt-1">
                +5% vs mes anterior
              </p>
            </div>
          </div>

          <div class="ui-card-hover">
            <div class="ui-card-body">
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Entregas Activas
              </h3>
              <p class="text-2xl font-bold text-gray-900 dark:text-gray-50">
                89
              </p>
              <p class="text-sm text-warning-600 dark:text-warning-400 mt-1">
                -2% vs mes anterior
              </p>
            </div>
          </div>
        </div>

        <!-- Demo Content -->
        <div class="ui-card">
          <div class="ui-card-header">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-50">
              PR#1 - Infraestructura Completada
            </h3>
          </div>
          <div class="ui-card-body">
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <div class="w-2 h-2 bg-success-500 rounded-full"></div>
                <span class="text-sm text-gray-700 dark:text-gray-300">
                  ✅ TailwindCSS configurado con diseño OpenAI-style
                </span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-2 h-2 bg-success-500 rounded-full"></div>
                <span class="text-sm text-gray-700 dark:text-gray-300">
                  ✅ Design tokens implementados (colores, espaciado, tipografía)
                </span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-2 h-2 bg-success-500 rounded-full"></div>
                <span class="text-sm text-gray-700 dark:text-gray-300">
                  ✅ Componentes UI reutilizables (.ui-btn, .ui-card, etc.)
                </span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-2 h-2 bg-success-500 rounded-full"></div>
                <span class="text-sm text-gray-700 dark:text-gray-300">
                  ✅ Dark mode funcional
                </span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-2 h-2 bg-success-500 rounded-full"></div>
                <span class="text-sm text-gray-700 dark:text-gray-300">
                  ✅ Lucide icons integrados
                </span>
              </div>
            </div>

            <div class="mt-6 p-4 bg-primary-50 dark:bg-primary-900/10 rounded-lg">
              <p class="text-sm text-primary-700 dark:text-primary-300">
                <strong>Próximos pasos:</strong> PR#2 implementará el shell (sidebar + topbar minimalistas)
                y PR#3 completará el sistema de login minimalista.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class DashboardComponent {
  isDarkMode = false;

  // Lucide icons
  readonly homeIcon = Home;
  readonly settingsIcon = Settings;
  readonly logOutIcon = LogOut;
  readonly sunIcon = Sun;
  readonly moonIcon = Moon;

  constructor(private router: Router) {
    // Check for saved dark mode preference
    this.isDarkMode = localStorage.getItem('darkMode') === 'true' ||
      (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);

    this.updateDarkMode();
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode.toString());
    this.updateDarkMode();
  }

  private updateDarkMode() {
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  logout() {
    // Clear any stored data
    localStorage.removeItem('authToken');

    // Navigate back to login
    this.router.navigate(['/login']);
  }
}