import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-usage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usage.component.html',
  styleUrls: ['./usage.component.scss']
})
export class UsageComponent implements AfterViewInit, OnDestroy {
  @ViewChild('usageChart') usageChart!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;
  tokens = 153450;
  requests = 1230;
  spend = 212.5;
  categories = [
    { name: 'Chat', tokens: 120000, requests: 900 },
    { name: 'Images', tokens: 20000, requests: 150 },
    { name: 'Audio', tokens: 13450, requests: 180 }
  ];

  ngAfterViewInit(): void {
    const labels = this.categories.map(c => c.name);
    const data = this.categories.map(c => c.tokens);

    this.chart = new Chart(this.usageChart.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            data,
            borderColor: '#0EA5E9',
            backgroundColor: 'rgba(14,165,233,0.2)',
            borderWidth: 1
          }
        ]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(148,163,184,0.2)' } },
          y: { beginAtZero: true, grid: { color: 'rgba(148,163,184,0.2)' } }
        },
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  exportCSV(): void {
    const rows = [
      ['Categoría', 'Tokens', 'Requests'],
      ...this.categories.map(c => [c.name, c.tokens, c.requests])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'usage.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}

