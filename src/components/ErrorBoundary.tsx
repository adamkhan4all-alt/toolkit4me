import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Top-level render-error safety net. Without this, an uncaught error
 * thrown during render anywhere in the tree (a bad tool page, a
 * third-party ad script interaction, a malformed API response mishandled
 * somewhere) white-screens the entire app with no way back for the user
 * except a manual reload. This catches it, shows a plain recovery screen,
 * and logs the error — it never swallows the error silently.
 *
 * Deliberately a class component: React's error boundary API
 * (getDerivedStateFromError / componentDidCatch) has no hook equivalent.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("Unhandled render error:", error, info.componentStack);
  }

  handleReload = () => {
    window.location.assign("/");
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-neutral-900">Something went wrong</h1>
          <p className="max-w-md text-sm text-neutral-600">
            We hit an unexpected error loading this page. Your files were never uploaded because of it — please
            reload and try again.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="focus-ring rounded-[var(--radius-control)] bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Reload Toolkit4Me
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
