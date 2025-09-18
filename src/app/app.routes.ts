import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login.component').then(c => c.LoginComponent),
    title: 'Login - Conductores PWA'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(c => c.DashboardComponent),
    title: 'Dashboard - Conductores PWA'
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
