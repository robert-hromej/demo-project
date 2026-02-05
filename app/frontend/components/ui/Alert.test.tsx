import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { Alert, ToastAlert } from "./Alert";

describe("Alert", () => {
  it("renders children content", () => {
    render(<Alert>Something happened</Alert>);
    expect(screen.getByText("Something happened")).toBeInTheDocument();
  });

  it("renders title", () => {
    render(<Alert title="Warning Title">Details here</Alert>);
    expect(screen.getByText("Warning Title")).toBeInTheDocument();
    expect(screen.getByText("Details here")).toBeInTheDocument();
  });

  it("renders with role='alert'", () => {
    render(<Alert>Message</Alert>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("applies success variant styles", () => {
    render(<Alert variant="success">Success</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert.className).toContain("bg-green-50");
    expect(alert.className).toContain("border-green-200");
    expect(alert.className).toContain("text-green-800");
  });

  it("applies error variant styles", () => {
    render(<Alert variant="error">Error</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert.className).toContain("bg-red-50");
    expect(alert.className).toContain("border-red-200");
    expect(alert.className).toContain("text-red-800");
  });

  it("applies warning variant styles", () => {
    render(<Alert variant="warning">Warning</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert.className).toContain("bg-yellow-50");
    expect(alert.className).toContain("border-yellow-200");
    expect(alert.className).toContain("text-yellow-800");
  });

  it("applies info variant styles by default", () => {
    render(<Alert>Info</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert.className).toContain("bg-blue-50");
    expect(alert.className).toContain("border-blue-200");
    expect(alert.className).toContain("text-blue-800");
  });

  it("shows dismiss button when dismissible is true", () => {
    render(<Alert dismissible>Dismissible</Alert>);
    expect(screen.getByLabelText("Dismiss alert")).toBeInTheDocument();
  });

  it("calls onDismiss when dismiss button is clicked", async () => {
    const user = userEvent.setup();
    const handleDismiss = vi.fn();
    render(
      <Alert dismissible onDismiss={handleDismiss}>
        Dismissible
      </Alert>
    );
    await user.click(screen.getByLabelText("Dismiss alert"));
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it("hides dismiss button when dismissible is false", () => {
    render(<Alert dismissible={false}>Not dismissible</Alert>);
    expect(screen.queryByLabelText("Dismiss alert")).not.toBeInTheDocument();
  });

  it("does not show dismiss button by default", () => {
    render(<Alert>Default</Alert>);
    expect(screen.queryByLabelText("Dismiss alert")).not.toBeInTheDocument();
  });

  it("renders custom icon", () => {
    render(<Alert icon={<span data-testid="custom-icon">!</span>}>Custom</Alert>);
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Alert ref={ref}>Ref test</Alert>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe("ToastAlert", () => {
  it("renders when show is true", () => {
    render(<ToastAlert show>Toast message</ToastAlert>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Toast message")).toBeInTheDocument();
  });

  it("returns null when show is false", () => {
    const { container } = render(<ToastAlert show={false}>Hidden</ToastAlert>);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(container.innerHTML).toBe("");
  });

  it("is dismissible by default", () => {
    render(<ToastAlert show>Dismissible toast</ToastAlert>);
    expect(screen.getByLabelText("Dismiss alert")).toBeInTheDocument();
  });

  it("calls onHide as dismiss handler when onDismiss is not provided", async () => {
    const user = userEvent.setup();
    const handleHide = vi.fn();
    render(
      <ToastAlert show onHide={handleHide}>
        Toast
      </ToastAlert>
    );
    await user.click(screen.getByLabelText("Dismiss alert"));
    expect(handleHide).toHaveBeenCalledTimes(1);
  });

  it("calls onDismiss instead of onHide when both are provided", async () => {
    const user = userEvent.setup();
    const handleDismiss = vi.fn();
    const handleHide = vi.fn();
    render(
      <ToastAlert show onDismiss={handleDismiss} onHide={handleHide}>
        Toast
      </ToastAlert>
    );
    await user.click(screen.getByLabelText("Dismiss alert"));
    expect(handleDismiss).toHaveBeenCalledTimes(1);
    expect(handleHide).not.toHaveBeenCalled();
  });

  it("auto-hides after duration", () => {
    vi.useFakeTimers();
    const handleHide = vi.fn();
    render(
      <ToastAlert show duration={3000} onHide={handleHide}>
        Timed toast
      </ToastAlert>
    );
    expect(handleHide).not.toHaveBeenCalled();
    vi.advanceTimersByTime(3000);
    expect(handleHide).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("applies shadow-lg class for toast appearance", () => {
    render(<ToastAlert show>Styled toast</ToastAlert>);
    const alert = screen.getByRole("alert");
    expect(alert.className).toContain("shadow-lg");
  });
});
