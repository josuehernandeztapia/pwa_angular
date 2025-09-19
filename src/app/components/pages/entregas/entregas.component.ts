import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-entregas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './entregas.component.html',
  styleUrls: ['./entregas.component.scss']
})
export class EntregasComponent {
  loading = true;
  eta = 75;

  ngOnInit() {
    setTimeout(() => {
      this.loading = false;
    }, 1500);
  }
}

