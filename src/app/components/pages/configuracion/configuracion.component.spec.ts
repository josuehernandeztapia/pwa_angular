import { TestBed } from '@angular/core/testing';
import { ConfiguracionComponent } from './configuracion.component';

describe('ConfiguracionComponent (Minimal UI)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfiguracionComponent]
    }).compileComponents();
  });

  it('should render mode buttons and toggle modo', () => {
    const fixture = TestBed.createComponent(ConfiguracionComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement as HTMLElement;
    const btnCot = el.querySelector('[data-cy="mode-cotizador"]') as HTMLButtonElement;
    const btnSim = el.querySelector('[data-cy="mode-simulador"]') as HTMLButtonElement;
    expect(btnCot).toBeTruthy();
    expect(btnSim).toBeTruthy();

    btnSim.click();
    fixture.detectChanges();
    expect(component.modo).toBe('simulador');

    btnCot.click();
    fixture.detectChanges();
    expect(component.modo).toBe('cotizador');
  });

  it('should validate form controls and show error messages', () => {
    const fixture = TestBed.createComponent(ConfiguracionComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.form.controls['nombre'].markAsTouched();
    component.form.controls['tipo'].markAsTouched();
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement as HTMLElement;
    const errors = el.querySelectorAll('.text-red-600');
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should render product packages with select buttons', () => {
    const fixture = TestBed.createComponent(ConfiguracionComponent);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement as HTMLElement;
    const selectButtons = el.querySelectorAll('[data-cy="select-package"]');
    expect(selectButtons.length).toBeGreaterThan(0);
  });
});

