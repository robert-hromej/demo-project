import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorBoundary, ErrorFallback, InlineError, withErrorBoundary } from "./ErrorBoundary";

// Component that throws an error on demand
function ThrowingComponent({ shouldThrow = false }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error("Test error message");
  }
  return <div>Child content</div>;
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    // Suppress console.error from React error boundary
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <div>Content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders default fallback when child throws", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders custom fallback when provided", () => {
    render(
      <ErrorBoundary fallback={<div>Custom error UI</div>}>
        <ThrowingComponent shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByText("Custom error UI")).toBeInTheDocument();
  });

  it("calls onError callback when error occurs", () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowingComponent shouldThrow />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Test error message" }),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
  });

  it("resets error state when reset is called", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();

    const { rerender } = render(
      <ErrorBoundary onReset={onReset}>
        <ThrowingComponent shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    await user.click(screen.getByText("Try again"));

    // After reset, it tries to render children again
    rerender(
      <ErrorBoundary onReset={onReset}>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(onReset).toHaveBeenCalled();
  });
});

describe("ErrorFallback", () => {
  it("renders title and description", () => {
    render(<ErrorFallback />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByText(/We're sorry, but something unexpected happened/)
    ).toBeInTheDocument();
  });

  it("renders custom title and description", () => {
    render(
      <ErrorFallback title="Custom Title" description="Custom description" />
    );

    expect(screen.getByText("Custom Title")).toBeInTheDocument();
    expect(screen.getByText("Custom description")).toBeInTheDocument();
  });

  it("renders error details in development mode", () => {
    const error = new Error("Detailed error");

    render(<ErrorFallback error={error} showError />);

    expect(screen.getByText("Detailed error")).toBeInTheDocument();
    expect(screen.getByText("Error details:")).toBeInTheDocument();
  });

  it("hides error details when showError is false", () => {
    const error = new Error("Hidden error");

    render(<ErrorFallback error={error} showError={false} />);

    expect(screen.queryByText("Hidden error")).not.toBeInTheDocument();
  });

  it("renders retry button when onReset is provided", () => {
    render(<ErrorFallback onReset={() => {}} />);

    expect(screen.getByText("Try again")).toBeInTheDocument();
  });

  it("renders home button when onGoHome is provided", () => {
    render(<ErrorFallback onGoHome={() => {}} />);

    expect(screen.getByText("Go to home")).toBeInTheDocument();
  });

  it("calls onReset when retry button is clicked", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();

    render(<ErrorFallback onReset={onReset} />);
    await user.click(screen.getByText("Try again"));

    expect(onReset).toHaveBeenCalled();
  });

  it("has alert role for accessibility", () => {
    render(<ErrorFallback />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});

describe("InlineError", () => {
  it("renders error message", () => {
    render(<InlineError message="Something failed" />);

    expect(screen.getByText("Something failed")).toBeInTheDocument();
  });

  it("renders retry button when onRetry is provided", () => {
    render(<InlineError message="Error" onRetry={() => {}} />);

    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  it("calls onRetry when clicked", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(<InlineError message="Error" onRetry={onRetry} />);
    await user.click(screen.getByText("Retry"));

    expect(onRetry).toHaveBeenCalled();
  });

  it("does not render retry button without onRetry", () => {
    render(<InlineError message="Error" />);

    expect(screen.queryByText("Retry")).not.toBeInTheDocument();
  });

  it("has alert role for accessibility", () => {
    render(<InlineError message="Error" />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});

describe("withErrorBoundary", () => {
  function TestComponent() {
    return <div>Wrapped content</div>;
  }

  it("wraps component with error boundary", () => {
    const Wrapped = withErrorBoundary(TestComponent);

    render(<Wrapped />);

    expect(screen.getByText("Wrapped content")).toBeInTheDocument();
  });

  it("sets displayName on wrapped component", () => {
    const Wrapped = withErrorBoundary(TestComponent);

    expect(Wrapped.displayName).toBe("withErrorBoundary(TestComponent)");
  });

  it("catches errors from wrapped component", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const Wrapped = withErrorBoundary(ThrowingComponent);

    render(<Wrapped shouldThrow />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });
});
