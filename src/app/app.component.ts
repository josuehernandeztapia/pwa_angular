import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';
import { MediaPermissionsService } from './services/media-permissions.service';
import { SwUpdateService } from './services/sw-update.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ShellComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'conductores-pwa';

  constructor(private mediaPermissions: MediaPermissionsService, _sw: SwUpdateService) {}

  async ngOnInit() {
    // Media permissions will be requested just-in-time when needed (voice/camera flows)
    const saved = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const enableDark = saved ? saved === 'true' : prefersDark;
    document.documentElement.classList.toggle('dark', enableDark);
  }
}
