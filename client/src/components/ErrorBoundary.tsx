import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

// Top-level safety net for unexpected render crashes — without this, an
// uncaught error anywhere in the tree unmounts the whole app to a blank
// white screen with no way back for the user.
export default class ErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled render error:', error, info.componentStack);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <h1 className="font-display font-medium text-2xl text-fc-ink mb-3">
            Something went wrong
          </h1>
          <p className="text-sm text-fc-ink-2 mb-6">
            Something on this page failed to load. Reloading usually fixes it — if the problem
            continues, contact us and we&apos;ll take a look.
          </p>
          <a
            href="/"
            className="inline-block text-sm font-medium bg-fc-sage-deep text-fc-white px-5 py-2.5 rounded-fc-md"
          >
            Back to home
          </a>
        </div>
      );
    }
    return this.props.children;
  }
}
