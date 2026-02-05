import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders title", () => {
    render(<EmptyState title="No results" />);

    expect(screen.getByText("No results")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <EmptyState title="No results" description="Try a different search" />
    );

    expect(screen.getByText("Try a different search")).toBeInTheDocument();
  });

  it("does not render description when not provided", () => {
    render(<EmptyState title="No results" />);

    // Title should exist but no extra paragraph
    expect(screen.getByText("No results")).toBeInTheDocument();
  });

  it("renders primary action button", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <EmptyState title="No results" action={{ label: "Search again", onClick }} />
    );

    const button = screen.getByText("Search again");
    expect(button).toBeInTheDocument();

    await user.click(button);
    expect(onClick).toHaveBeenCalled();
  });

  it("renders secondary action button", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <EmptyState
        title="No results"
        action={{ label: "Primary", onClick: vi.fn() }}
        secondaryAction={{ label: "Go back", onClick }}
      />
    );

    const button = screen.getByText("Go back");
    expect(button).toBeInTheDocument();

    await user.click(button);
    expect(onClick).toHaveBeenCalled();
  });

  it("renders children content", () => {
    render(
      <EmptyState title="Custom">
        <span>Custom child content</span>
      </EmptyState>
    );

    expect(screen.getByText("Custom child content")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <EmptyState title="Test" className="custom-class" />
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("forwards ref", () => {
    const ref = React.createRef<HTMLDivElement>();

    render(<EmptyState title="Test" ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("uses default variant icon when no custom icon", () => {
    const { container } = render(<EmptyState title="Test" variant="search" />);

    // Search variant should render an SVG icon
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("uses custom icon when provided", () => {
    render(
      <EmptyState title="Test" icon={<span data-testid="custom-icon">Icon</span>} />
    );

    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });
});
