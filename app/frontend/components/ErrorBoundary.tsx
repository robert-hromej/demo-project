import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  handleGoHome = (): void => {
    window.location.href = "/";
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
          onGoHome={this.handleGoHome}
        />
      );
    }

    return this.props.children;
  }
}

// Functional fallback component
export interface ErrorFallbackProps {
  error?: Error | null;
  onReset?: () => void;
  onGoHome?: () => void;
  title?: string;
  description?: string;
  showError?: boolean;
  className?: string;
}

export function ErrorFallback({
  error,
  onReset,
  onGoHome,
  title = "Something went wrong",
  description = "We're sorry, but something unexpected happened. Please try again or go back to the home page.",
  showError = process.env.NODE_ENV === "development",
  className,
}: ErrorFallbackProps): ReactNode {
  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center p-8 text-center",
        className
      )}
      role="alert"
    >
      <div className="mb-6 rounded-full bg-red-100 p-4">
        <AlertTriangle className="h-12 w-12 text-red-600" />
      </div>

      <h2 className="mb-2 text-2xl font-bold text-gray-900">{title}</h2>
      <p className="mb-6 max-w-md text-gray-600">{description}</p>

      {showError && error && (
        <div className="mb-6 w-full max-w-lg rounded-lg bg-gray-100 p-4 text-left">
          <p className="mb-2 text-sm font-medium text-gray-700">Error details:</p>
          <pre className="overflow-auto text-xs text-red-600">{error.message}</pre>
          {error.stack && (
            <pre className="mt-2 overflow-auto text-xs text-gray-500">{error.stack}</pre>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        {onReset && (
          <Button variant="primary" onClick={onReset} leftIcon={<RefreshCw />}>
            Try again
          </Button>
        )}
        {onGoHome && (
          <Button variant="outline" onClick={onGoHome} leftIcon={<Home />}>
            Go to home
          </Button>
        )}
      </div>
    </div>
  );
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">
): React.ComponentType<P> {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || "Component";

  const ComponentWithErrorBoundary = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;

  return ComponentWithErrorBoundary;
}

// Simple error message for inline errors
export interface InlineErrorProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function InlineError({ message, onRetry, className }: InlineErrorProps): ReactNode {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800",
        className
      )}
      role="alert"
    >
      <AlertTriangle className="h-5 w-5 shrink-0" />
      <span className="flex-1 text-sm">{message}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="text-sm font-medium text-red-600 hover:text-red-800 underline"
        >
          Retry
        </button>
      )}
    </div>
  );
}
