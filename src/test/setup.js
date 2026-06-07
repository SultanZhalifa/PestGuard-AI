// Vitest global setup — extends expect with jest-dom matchers and provides
// browser API shims that jsdom does not implement.
import '@testing-library/jest-dom/vitest';

// jsdom lacks matchMedia; some components query it for reduced-motion / theme.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}
