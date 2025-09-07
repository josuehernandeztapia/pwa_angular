import { Injectable } from '@angular/core';

type FontScale = 'base' | 'sm' | 'lg';

@Injectable({ providedIn: 'root' })
export class UserPreferencesService {
  private readonly LS_FONT = 'ux.pref.fontScale';
  private readonly LS_HC = 'ux.pref.hc';

  initFromStorage(): void {
    const savedScale = (localStorage.getItem(this.LS_FONT) as FontScale | null) ?? 'base';
    const savedHc = localStorage.getItem(this.LS_HC) === 'true';
    this.applyFontScale(savedScale);
    this.applyHighContrast(savedHc);
  }

  getFontScale(): FontScale {
    return (localStorage.getItem(this.LS_FONT) as FontScale | null) ?? 'base';
  }

  setFontScale(scale: FontScale): void {
    localStorage.setItem(this.LS_FONT, scale);
    this.applyFontScale(scale);
  }

  private applyFontScale(scale: FontScale): void {
    const html = document.documentElement;
    html.classList.remove('senior-sm', 'senior-lg');
    if (scale === 'sm') html.classList.add('senior-sm');
    if (scale === 'lg') html.classList.add('senior-lg');
  }

  getHighContrast(): boolean {
    return localStorage.getItem(this.LS_HC) === 'true';
  }

  setHighContrast(enabled: boolean): void {
    localStorage.setItem(this.LS_HC, String(enabled));
    this.applyHighContrast(enabled);
  }

  private applyHighContrast(enabled: boolean): void {
    const html = document.documentElement;
    html.classList.toggle('hc', enabled);
  }
}

