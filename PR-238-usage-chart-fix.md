## PR#238 – Usage/Reports: Chart.js bars visibility fix

### Summary
- Ensure bars in the Usage/Reports Chart.js graph are always visible by adding a subtle `backgroundColor` and explicit `borderWidth`.
- Improve lifecycle handling using `@ViewChild` and `ngOnDestroy()` to prevent memory leaks.

### Changes
- `src/app/components/pages/usage/usage.component.ts`
  - Dataset: add `backgroundColor: 'rgba(14,165,233,0.2)'` and `borderWidth: 1`.
  - Use `@ViewChild('usageChart')` to pass the canvas element to `new Chart(...)`.
  - Add `ngOnDestroy()` to `destroy()` the chart instance.
  - Keep minimalist styling; `y` axis begins at zero.
- `src/app/components/pages/usage/usage.component.html`
  - Add template ref `#usageChart` and wrap canvas with a fixed-height container to maintain aspect ratio responsively.

### Rationale
- Previously, the dataset used `borderColor` with `backgroundColor: 'transparent'`. Without an explicit `borderWidth`, bars could be visually imperceptible in some themes. Adding a subtle fill and `borderWidth` guarantees visibility while preserving the clean aesthetic.

### Validation
- Manually validated rendering locally; bars are now visible with subtle fill.
- Existing id `usageChart` and `data-cy` attribute are preserved for UI/E2E tests.

### Risk & Impact
- Low risk: visual-only enhancement to a single chart; no API or data flow changes.
- Memory safety improved via lifecycle cleanup.

### Before
```ts
backgroundColor: 'transparent'
// (no borderWidth)
```

### After
```ts
backgroundColor: 'rgba(14,165,233,0.2)'
borderWidth: 1
```

