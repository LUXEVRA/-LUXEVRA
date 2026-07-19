/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Safeguard: redefine window.fetch to be writable and configurable.
// This prevents sandboxed iframes, proxy wrappers, or browser extensions from throwing
// "Cannot set property fetch of #<Window> which has only a getter" when intercepting fetch.
try {
  if (typeof window !== "undefined" && window.fetch) {
    const originalFetch = window.fetch;
    Object.defineProperty(window, "fetch", {
      value: originalFetch,
      writable: true,
      configurable: true,
      enumerable: true,
    });
  }
} catch (e) {
  console.warn("Safeguard: Failed to redefine window.fetch as writable:", e);
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

