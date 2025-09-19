import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface UserRow {
  id: string;
  name: string;
  role: string;
  active: boolean;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios.component.html'
})
export class UsuariosComponent {
  users: UserRow[] = [
    { id: '1', name: 'María Gómez', role: 'Administrador', active: true },
    { id: '2', name: 'Juan Pérez', role: 'Editor', active: true },
    { id: '3', name: 'Ana López', role: 'Visor', active: false }
  ];

  edit(user: UserRow): void {
    console.log('Editar usuario', user);
  }

  toggle(user: UserRow): void {
    user.active = !user.active;
  }
}

