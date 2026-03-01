import { StrictMode, Component } from 'react';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { SmoothScroll } from './utils/SmoothScroll.tsx';

// Global error trap — surfaces silent crashes on blank pages
window.onerror = (msg, src, line, col, err) => {
  document.body.innerHTML = `<pre style="padding:24px;color:red;font-size:14px">
RUNTIME ERROR: ${msg}
Source: ${src}:${line}:${col}
${err?.stack ?? ''}
    </pre>`;
};

window.addEventListener('unhandledrejection', e => {
  document.body.innerHTML = `<pre style="padding:24px;color:red;font-size:14px">
UNHANDLED PROMISE: ${e.reason}
    </pre>`;
});

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(e: Error) { return { error: e }; }
  render() {
    if (this.state.error) {
      const e = this.state.error as Error;
      return <pre style={{ padding: 24, color: 'red', fontSize: 14 }}>{e.stack ?? e.message}</pre>;
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <SmoothScroll />
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

