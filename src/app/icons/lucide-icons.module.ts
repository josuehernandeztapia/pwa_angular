import { NgModule } from '@angular/core';
import { BarChart, Calculator, LucideAngularModule, Settings, Users } from 'lucide-angular';

const ICONS = { BarChart, Users, Calculator, Settings };

@NgModule({
  imports: [LucideAngularModule.pick(ICONS)],
  exports: [LucideAngularModule]
})
export class LucideIconsModule {}

