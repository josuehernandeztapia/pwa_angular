import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-offline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './offline.component.html'
})
export class OfflineComponent {
  retry(): void {
    window.location.reload();
  }
}

