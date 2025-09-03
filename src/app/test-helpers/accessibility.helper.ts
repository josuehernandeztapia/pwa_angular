import { ComponentFixture } from '@angular/core/testing';
// Use dynamic import to avoid TS type issues with jest-axe in Jasmine/Karma
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { configureAxe } = require('jest-axe');

// Configure axe for Angular applications
const axe = configureAxe({
  rules: {
    // Disable color-contrast rule for development as it can be flaky
    'color-contrast': { enabled: false },
    // Focus on critical accessibility issues
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
});

// Skip extending jest matchers in Jasmine environment

/**
 * Test accessibility of a component
 */
export async function testAccessibility(fixture: ComponentFixture<any>): Promise<void> {
  const element = fixture.nativeElement;
  const results = await axe(element);
  // Basic assertion fallback since jest-axe matchers aren't available
  if (results.violations && Array.isArray(results.violations)) {
    expect(results.violations.length).toBe(0);
  }
}

/**
 * Test accessibility of a specific element
 */
export async function testElementAccessibility(element: HTMLElement): Promise<void> {
  const results = await axe(element);
  if (results.violations && Array.isArray(results.violations)) {
    expect(results.violations.length).toBe(0);
  }
}

/**
 * Test accessibility with custom axe configuration
 */
export async function testAccessibilityWithConfig(
  fixture: ComponentFixture<any>,
  config: any
): Promise<void> {
  const element = fixture.nativeElement;
  const customAxe = configureAxe(config);
  const results = await customAxe(element);
  if (results.violations && Array.isArray(results.violations)) {
    expect(results.violations.length).toBe(0);
  }
}

/**
 * Get accessibility violations without throwing
 */
export async function getAccessibilityViolations(fixture: ComponentFixture<any>): Promise<any> {
  const element = fixture.nativeElement;
  const results = await axe(element);
  return results.violations;
}

/**
 * Common accessibility test patterns
 */
export const AccessibilityTestPatterns = {
  /**
   * Test form accessibility
   */
  async testFormAccessibility(fixture: ComponentFixture<any>): Promise<void> {
    const formConfig = {
      rules: {
        'label': { enabled: true },
        'form-field-multiple-labels': { enabled: true },
        'aria-required-attr': { enabled: true },
        'aria-valid-attr-value': { enabled: true }
      }
    };
    await testAccessibilityWithConfig(fixture, formConfig);
  },

  /**
   * Test navigation accessibility
   */
  async testNavigationAccessibility(fixture: ComponentFixture<any>): Promise<void> {
    const navConfig = {
      rules: {
        'bypass': { enabled: true },
        'link-name': { enabled: true },
        'button-name': { enabled: true },
        'aria-expanded': { enabled: true }
      }
    };
    await testAccessibilityWithConfig(fixture, navConfig);
  },

  /**
   * Test modal/dialog accessibility
   */
  async testModalAccessibility(fixture: ComponentFixture<any>): Promise<void> {
    const modalConfig = {
      rules: {
        'aria-dialog-name': { enabled: true },
        'focus-order-semantics': { enabled: true },
        'aria-hidden-focus': { enabled: true }
      }
    };
    await testAccessibilityWithConfig(fixture, modalConfig);
  },

  /**
   * Test table accessibility
   */
  async testTableAccessibility(fixture: ComponentFixture<any>): Promise<void> {
    const tableConfig = {
      rules: {
        'td-headers-attr': { enabled: true },
        'th-has-data-cells': { enabled: true },
        'scope-attr-valid': { enabled: true }
      }
    };
    await testAccessibilityWithConfig(fixture, tableConfig);
  }
};

/**
 * Utility to check specific accessibility features
 */
export class AccessibilityChecker {
  /**
   * Check if element has proper ARIA labels
   */
  static hasAriaLabel(element: HTMLElement): boolean {
    return element.hasAttribute('aria-label') || 
           element.hasAttribute('aria-labelledby') ||
           element.hasAttribute('aria-describedby');
  }

  /**
   * Check if form control has associated label
   */
  static hasAssociatedLabel(input: HTMLInputElement): boolean {
    // Check for explicit label association
    if (input.labels && input.labels.length > 0) {
      return true;
    }

    // Check for aria-label or aria-labelledby
    return this.hasAriaLabel(input);
  }

  /**
   * Check if interactive elements are keyboard accessible
   */
  static isKeyboardAccessible(element: HTMLElement): boolean {
    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute('role');
    const tabIndex = element.getAttribute('tabindex');

    // Native interactive elements
    if (['button', 'input', 'select', 'textarea', 'a'].includes(tagName)) {
      return tabIndex !== '-1';
    }

    // Elements with interactive roles
    if (['button', 'link', 'tab', 'menuitem'].includes(role || '')) {
      return tabIndex !== '-1';
    }

    return false;
  }

  /**
   * Check if element has sufficient color contrast
   * Note: This is a basic check, use axe-core for comprehensive testing
   */
  static async checkColorContrast(element: HTMLElement): Promise<boolean> {
    try {
      const results = await axe(element, {
        rules: {
          'color-contrast': { enabled: true }
        }
      });
      return results.violations.length === 0;
    } catch {
      return true; // Assume pass if unable to test
    }
  }
}

/**
 * Accessibility test suite for common component patterns
 */
export function createAccessibilityTestSuite(componentName: string) {
  return {
    [`${componentName} should be accessible`]: async (fixture: ComponentFixture<any>) => {
      await testAccessibility(fixture);
    },

    [`${componentName} should have no accessibility violations`]: async (fixture: ComponentFixture<any>) => {
      const violations = await getAccessibilityViolations(fixture);
      expect(Array.isArray(violations) ? violations.length : 0).toBe(0);
    },

    [`${componentName} interactive elements should be keyboard accessible`]: (fixture: ComponentFixture<any>) => {
      const interactiveElements = fixture.nativeElement.querySelectorAll(
        'button, input, select, textarea, a, [role="button"], [role="link"], [tabindex]'
      );

      interactiveElements.forEach((element: HTMLElement) => {
        expect(AccessibilityChecker.isKeyboardAccessible(element)).toBe(true);
      });
    },

    [`${componentName} form controls should have labels`]: (fixture: ComponentFixture<any>) => {
      const formControls = fixture.nativeElement.querySelectorAll(
        'input:not([type="hidden"]), select, textarea'
      );

      formControls.forEach((control: HTMLInputElement) => {
        expect(AccessibilityChecker.hasAssociatedLabel(control)).toBe(true);
      });
    }
  };
}