import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
    // TODO: Send to error tracking service like Sentry for production
    // Example: Sentry.captureException(error);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
          <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="bg-red-50 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <AlertTriangle className="text-red-500" size={48} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              We encountered an unexpected error. Don't worry, your data is
              safe. Please try refreshing the page.
            </p>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mb-6 text-left bg-slate-50 p-4 rounded-lg">
                <summary className="cursor-pointer text-xs font-bold text-slate-600 mb-2">
                  Error Details (Dev Mode)
                </summary>
                <pre className="text-xs text-red-600 overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 mx-auto px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all active:scale-95 font-medium"
            >
              <RefreshCw size={18} /> Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
