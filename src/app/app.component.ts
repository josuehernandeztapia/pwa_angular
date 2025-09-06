import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from './components/shared/navigation/navigation.component';
import { BottomNavBarComponent } from './components/shared/bottom-nav-bar/bottom-nav-bar.component';
import { MediaPermissionsService } from './services/media-permissions.service';
import { SwUpdateService } from './services/sw-update.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavigationComponent, BottomNavBarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'conductores-pwa';

  constructor(
    private mediaPermissions: MediaPermissionsService,
    private swUpdateService: SwUpdateService
  ) {}

  async ngOnInit() {
    // Initialize PWA update handling
    this.swUpdateService.init();

    // Request camera and microphone permissions on PWA startup
    if (this.mediaPermissions.isSupported()) {
      try {
        const permissions = await this.mediaPermissions.requestCameraAndMicrophonePermissions();
        console.log('Media permissions:', permissions);
      } catch (error) {
        console.warn('Error requesting media permissions:', error);
      }
    }
  }
}
