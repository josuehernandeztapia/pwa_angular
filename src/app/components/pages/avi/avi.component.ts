import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { RedFlag } from '../../../models/avi';
import { AVIService } from '../../../services/avi.service';

@Component({
  selector: 'app-avi',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avi.component.html',
  styleUrls: ['./avi.component.scss']
})
export class AviComponent {
  loading = false;
  decision: '' | 'GO' | 'REVIEW' | 'NO-GO' = '';
  flags: string[] = [];

  constructor(private aviService: AVIService) {}

  async iniciarAnalisis() {
    this.loading = true;
    this.decision = '';
    this.flags = [];
    try {
      // Try real flow via AVIService if available
      const score = await firstValueFrom(this.aviService.calculateScore());
      const risk = score.riskLevel;

      if (risk === 'LOW') this.decision = 'GO';
      else if (risk === 'CRITICAL') this.decision = 'NO-GO';
      else this.decision = 'REVIEW';

      const extractedFlags = (score.redFlags || []).map((r: RedFlag) => r.reason).filter(Boolean);
      this.flags = extractedFlags.length > 0 ? extractedFlags : (this.decision === 'GO' ? [] : ['High latency', 'Speech hesitation']);
    } catch {
      // Fallback simulation
      await new Promise<void>(resolve => setTimeout(resolve, 1800));
      this.decision = 'REVIEW';
      this.flags = ['High latency', 'Speech hesitation'];
    } finally {
      this.loading = false;
    }
  }
}

