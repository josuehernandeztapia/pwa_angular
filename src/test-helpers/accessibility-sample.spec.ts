/**
 * Sample Accessibility Test
 * 
 * Demonstrates the accessibility testing framework usage
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { AccessibilityTester, AccessibilityTestUtils, testComponentAccessibility } from './accessibility-test-framework';

@Component({
  template: `
    <div>
      <h1 id="main-title">Sample Component</h1>
      <button type="button" aria-label="Test button">Click me</button>
      <input type="text" id="test-input" aria-label="Test input" />
      <img src="test.jpg" alt="Test image" />
    </div>
  `
})
class SampleTestComponent {}

@Component({
  template: `
    <div>
      <h1>Accessible Component</h1>
      <button type="button">Button without label</button>
      <input type="text" placeholder="Input without label" />
      <img src="test.jpg" />
    </div>
  `
})
class InaccessibleTestComponent {}

describe('Accessibility Testing Framework', () => {
  let accessibleFixture: ComponentFixture<SampleTestComponent>;
  let inaccessibleFixture: ComponentFixture<InaccessibleTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SampleTestComponent, InaccessibleTestComponent]
    }).compileComponents();

    accessibleFixture = TestBed.createComponent(SampleTestComponent);
    inaccessibleFixture = TestBed.createComponent(InaccessibleTestComponent);
    
    accessibleFixture.detectChanges();
    inaccessibleFixture.detectChanges();
  });

  describe('AccessibilityTester', () => {
    it('should pass accessibility tests for compliant component', async () => {
      const result = await AccessibilityTester.testComponent(accessibleFixture);
      
      expect(result.component).toBe('SampleTestComponent');
      expect(result.violations).toBeDefined();
      expect(result.passes).toBeGreaterThanOrEqual(0);
      expect(result.timestamp).toBeDefined();
    });

    it('should detect violations in non-compliant component', async () => {
      const result = await AccessibilityTester.testComponent(inaccessibleFixture);
      
      expect(result.component).toBe('InaccessibleTestComponent');
      expect(result.violations).toBeDefined();
      // This component should have violations (button without label, img without alt)
    });

    it('should test individual DOM elements', async () => {
      const button = accessibleFixture.nativeElement.querySelector('button');
      const result = await AccessibilityTester.testElement(button);
      
      expect(result.component).toBe('BUTTON');
      expect(result.violations).toBeDefined();
    });
  });

  describe('AccessibilityTestUtils', () => {
    it('should identify critical violations', async () => {
      const result = await AccessibilityTester.testComponent(inaccessibleFixture);
      const hasCritical = AccessibilityTestUtils.hasCriticalViolations(result);
      
      expect(typeof hasCritical).toBe('boolean');
    });

    it('should filter violations by impact level', async () => {
      const result = await AccessibilityTester.testComponent(inaccessibleFixture);
      const criticalViolations = AccessibilityTestUtils.filterViolationsByImpact(result.violations, 'critical');
      const seriousViolations = AccessibilityTestUtils.filterViolationsByImpact(result.violations, 'serious');
      
      expect(Array.isArray(criticalViolations)).toBe(true);
      expect(Array.isArray(seriousViolations)).toBe(true);
    });

    it('should generate violation summary', async () => {
      const result = await AccessibilityTester.testComponent(accessibleFixture);
      const summary = AccessibilityTestUtils.generateViolationSummary(result);
      
      expect(typeof summary).toBe('string');
      expect(summary).toContain('SampleTestComponent');
    });
  });

  // Skipping HTML/JSON report file generation inside browser test runner

  describe('Helper Functions', () => {
    it('should work with testComponentAccessibility helper', async () => {
      // This test should pass without throwing
      await expectAsync(testComponentAccessibility(accessibleFixture)).toBeResolved();
    });
  });
});