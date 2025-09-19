import { NgModule } from '@angular/core';
import { BarChart, Calculator, LucideAngularModule, Mic, Settings, Users } from 'lucide-angular';

const ICONS = { BarChart, Users, Calculator, Settings, Mic };

@NgModule({
  imports: [LucideAngularModule.pick(ICONS)],
  exports: [LucideAngularModule]
})
export class LucideIconsModule {}

