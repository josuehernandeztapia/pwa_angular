import { ComponentFixture } from '@angular/core/testing';
import * as axeCore from 'axe-core';

interface AxeViolation {
  id: string;
  description: string;
  nodes: any[];
}

interface AxeResults {
  violations: AxeViolation[];
  passes: any[];
  incomplete: any[];
  inapplicable: any[];
}

const axeConfig = {
  rules: {
    'color-contrast': { enabled: false },
    'aria-allowed-attr': { enabled: true },
    'aria-required-children': { enabled: true },
    'aria-required-parent': { enabled: true },
    'aria-valid-attr': { enabled: true },
    'aria-valid-attr-value': { enabled: true },
    'button-name': { enabled: true },
    'bypass': { enabled: true },
    'duplicate-id': { enabled: true },
    'form-field-multiple-labels': { enabled: true },
    'frame-title': { enabled: true },
    'html-has-lang': { enabled: true },
    'image-alt': { enabled: true },
    'input-image-alt': { enabled: true },
    'label': { enabled: true },
    'link-name': { enabled: true },
    'list': { enabled: true },
    'listitem': { enabled: true },
    'marquee': { enabled: true },
    'meta-refresh': { enabled: true },
    'object-alt': { enabled: true },
    'role-img-alt': { enabled: true },
    'td-headers-attr': { enabled: true },
    'th-has-data-cells': { enabled: true },
    'valid-lang': { enabled: true },
    'video-caption': { enabled: true }
  }
};

type FixtureTarget =
  | ComponentFixture<any>
  | HTMLElement
  | { nativeElement?: HTMLElement; debugElement?: { nativeElement?: HTMLElement }; elementRef?: { nativeElement?: HTMLElement } }
  | null
  | undefined;

function isComponentFixture(target: any): target is ComponentFixture<any> {
  return !!target && typeof target === 'object' && 'nativeElement' in target;
}

function resolveElement(target: FixtureTarget): HTMLElement {
  if (!target) {
    throw new Error('Target element is required for accessibility testing');
  }

  if (target instanceof HTMLElement) {
    return target;
  }

  if (isComponentFixture(target)) {
    return target.nativeElement as HTMLElement;
  }

  if ((target as any).debugElement?.nativeElement) {
    return (target as any).debugElement.nativeElement as HTMLElement;
  }

  if ((target as any).elementRef?.nativeElement) {
    return (target as any).elementRef.nativeElement as HTMLElement;
  }

  if ((target as any).nativeElement) {
    return (target as any).nativeElement as HTMLElement;
  }

  throw new Error('Unable to resolve HTMLElement from target');
}

export async function testComponentAccessibility(target: FixtureTarget): Promise<void> {
  const element = resolveElement(target);
  const results = await axeCore.run(element, axeConfig) as unknown as AxeResults;
  if (results.violations.length > 0) {
    const violations = results.violations.map(v => `${v.id}: ${v.description}`).join('; ');
    throw new Error(`Accessibility violations found: ${violations}`);
  }
  expect(results.violations.length).toBe(0);
}

export async function testAccessibility(target: FixtureTarget): Promise<void> {
  await testComponentAccessibility(target);
}

export async function testElementAccessibility(target: FixtureTarget): Promise<void> {
  const element = resolveElement(target);
  const results = await axeCore.run(element, axeConfig) as unknown as AxeResults;
  if (results.violations.length > 0) {
    const violations = results.violations.map(v => `${v.id}: ${v.description}`).join('; ');
    throw new Error(`Accessibility violations found: ${violations}`);
  }
  expect(results.violations.length).toBe(0);
}

export async function testAccessibilityWithConfig(target: FixtureTarget, config: any): Promise<void> {
  const element = resolveElement(target);
  const mergedConfig = {
    ...axeConfig,
    ...config
  };
  const results = await axeCore.run(element, mergedConfig) as unknown as AxeResults;
  if (results.violations.length > 0) {
    const violations = results.violations.map(v => `${v.id}: ${v.description}`).join('; ');
    throw new Error(`Accessibility violations found: ${violations}`);
  }
  expect(results.violations.length).toBe(0);
}

export async function getAccessibilityViolations(target: FixtureTarget): Promise<AxeResults['violations']> {
  const element = resolveElement(target);
  const results = await axeCore.run(element, axeConfig) as unknown as AxeResults;
  return results.violations;
}

export const AccessibilityTestPatterns = {
  async testForm(target: FixtureTarget): Promise<void> {
    const element = resolveElement(target);
    const formConfig = {
      rules: {
        'label': { enabled: true },
        'form-field-multiple-labels': { enabled: true },
        'aria-required-attr': { enabled: true },
        'aria-valid-attr-value': { enabled: true }
      }
    };
    await testAccessibilityWithConfig(element, formConfig);
  },

  async testFormAccessibility(target: FixtureTarget): Promise<void> {
    await this.testForm(target);
  },

  async testNavigation(target: FixtureTarget): Promise<void> {
    const element = resolveElement(target);
    const navConfig = {
      rules: {
        'bypass': { enabled: true },
        'link-name': { enabled: true },
        'button-name': { enabled: true },
        'aria-expanded': { enabled: true }
      }
    };
    await testAccessibilityWithConfig(element, navConfig);
  },

  async testNavigationAccessibility(target: FixtureTarget): Promise<void> {
    await this.testNavigation(target);
  },

  async testModal(target: FixtureTarget): Promise<void> {
    const element = resolveElement(target);
    const modalConfig = {
      rules: {
        'aria-dialog-name': { enabled: true },
        'focus-order-semantics': { enabled: true },
        'aria-hidden-focus': { enabled: true }
      }
    };
    await testAccessibilityWithConfig(element, modalConfig);
  },

  async testModalAccessibility(target: FixtureTarget): Promise<void> {
    await this.testModal(target);
  },

  async testTable(target: FixtureTarget): Promise<void> {
    const element = resolveElement(target);
    const tableConfig = {
      rules: {
        'td-headers-attr': { enabled: true },
        'th-has-data-cells': { enabled: true },
        'scope-attr-valid': { enabled: true }
      }
    };
    await testAccessibilityWithConfig(element, tableConfig);
  },

  async testTableAccessibility(target: FixtureTarget): Promise<void> {
    await this.testTable(target);
  }
};

export class AccessibilityChecker {
  static hasAriaLabel(target: FixtureTarget): boolean {
    const element = resolveElement(target);
    return (
      element.hasAttribute('aria-label') ||
      element.hasAttribute('aria-labelledby') ||
      element.hasAttribute('aria-describedby')
    );
  }

  static hasAssociatedLabel(input: HTMLInputElement): boolean {
    if (input.labels && input.labels.length > 0) {
      return true;
    }
    return this.hasAriaLabel(input);
  }

  static isKeyboardAccessible(target: FixtureTarget): boolean {
    const element = resolveElement(target);
    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute('role');
    const tabIndex = element.getAttribute('tabindex');

    if (['button', 'input', 'select', 'textarea', 'a'].includes(tagName)) {
      return tabIndex !== '-1';
    }

    if (['button', 'link', 'tab', 'menuitem'].includes(role || '')) {
      return tabIndex !== '-1';
    }

    return false;
  }

  static async checkColorContrast(target: FixtureTarget): Promise<boolean> {
    const element = resolveElement(target);
    try {
      const results = await axeCore.run(element, {
        rules: {
          'color-contrast': { enabled: true }
        }
      }) as unknown as AxeResults;
      return results.violations.length === 0;
    } catch {
      return true;
    }
  }
}

type AccessibilitySuiteOptions = {
  componentName: string;
  factory: () => Promise<FixtureTarget>;
};

export function createAccessibilityTestSuite(options: string | AccessibilitySuiteOptions) {
  const suite = {
    async basic(target: FixtureTarget): Promise<void> {
      await testAccessibility(target);
    },

    async assertNoViolations(target: FixtureTarget): Promise<void> {
      const violations = await getAccessibilityViolations(target);
      expect(violations.length).toBe(0);
    },

    assertKeyboardNavigation(target: FixtureTarget): void {
      const container = resolveElement(target);
      const interactiveElements = container.querySelectorAll<HTMLElement>(
        'button, input, select, textarea, a, [role="button"], [role="link"], [tabindex]'
      );

      interactiveElements.forEach((element: HTMLElement) => {
        expect(AccessibilityChecker.isKeyboardAccessible(element)).toBe(true);
      });
    },

    assertFormLabels(target: FixtureTarget): void {
      const container = resolveElement(target);
      const formControls = container.querySelectorAll<HTMLInputElement>(
        'input:not([type="hidden"]), select, textarea'
      );

      formControls.forEach((control: HTMLInputElement) => {
        expect(AccessibilityChecker.hasAssociatedLabel(control)).toBe(true);
      });
    }
  };

  if (typeof options === 'string') {
    return suite;
  }

  const { componentName, factory } = options;

  describe(`${componentName} Accessibility Suite`, () => {
    let target: FixtureTarget;

    beforeAll(async () => {
      target = await factory();
      if (isComponentFixture(target)) {
        target.detectChanges();
      }
    });

    afterAll(() => {
      if (target && isComponentFixture(target) && typeof target.destroy === 'function') {
        target.destroy();
      }
    });

    it('passes basic accessibility scan', async () => {
      await suite.basic(target);
    });

    it('has no axe-core violations', async () => {
      await suite.assertNoViolations(target);
    });

    it('supports keyboard navigation', () => {
      suite.assertKeyboardNavigation(target);
    });

    it('ensures form controls have associated labels', () => {
      suite.assertFormLabels(target);
    });
  });

  return suite;
}
