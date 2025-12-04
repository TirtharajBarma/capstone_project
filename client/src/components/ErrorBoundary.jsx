import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-8 text-center">
          <div className="mb-6 rounded-full bg-red-100 p-6">
            <span className="material-symbols-outlined text-4xl text-red-600">error_outline</span>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Something went wrong</h1>
          <p className="mb-6 max-w-md text-gray-600">
            We're sorry, but an unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Refresh Page
          </button>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className="mt-8 w-full max-w-2xl overflow-hidden rounded-lg border border-red-200 bg-red-50 p-4 text-left">
              <p className="mb-2 font-mono text-sm font-bold text-red-800">Error Details:</p>
              <pre className="overflow-auto text-xs text-red-700">
                {this.state.error.toString()}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
