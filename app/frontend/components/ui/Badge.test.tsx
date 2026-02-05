import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { Badge, DifficultyBadge, CategoryBadge } from "./Badge";

describe("Badge", () => {
  it("renders children", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("applies default variant styles", () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText("Default");
    expect(badge.className).toContain("bg-gray-100");
    expect(badge.className).toContain("text-gray-700");
  });

  it("applies primary variant styles", () => {
    render(<Badge variant="primary">Primary</Badge>);
    const badge = screen.getByText("Primary");
    expect(badge.className).toContain("bg-orange-100");
    expect(badge.className).toContain("text-orange-700");
  });

  it("applies secondary variant styles", () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    const badge = screen.getByText("Secondary");
    expect(badge.className).toContain("bg-gray-100");
    expect(badge.className).toContain("text-gray-700");
  });

  it("applies success variant styles", () => {
    render(<Badge variant="success">Success</Badge>);
    const badge = screen.getByText("Success");
    expect(badge.className).toContain("bg-green-100");
    expect(badge.className).toContain("text-green-700");
  });

  it("applies warning variant styles", () => {
    render(<Badge variant="warning">Warning</Badge>);
    const badge = screen.getByText("Warning");
    expect(badge.className).toContain("bg-yellow-100");
    expect(badge.className).toContain("text-yellow-700");
  });

  it("applies error variant styles", () => {
    render(<Badge variant="error">Error</Badge>);
    const badge = screen.getByText("Error");
    expect(badge.className).toContain("bg-red-100");
    expect(badge.className).toContain("text-red-700");
  });

  it("applies info variant styles", () => {
    render(<Badge variant="info">Info</Badge>);
    const badge = screen.getByText("Info");
    expect(badge.className).toContain("bg-blue-100");
    expect(badge.className).toContain("text-blue-700");
  });

  it("applies sm size styles", () => {
    render(<Badge size="sm">Small</Badge>);
    const badge = screen.getByText("Small");
    expect(badge.className).toContain("px-2");
    expect(badge.className).toContain("py-0.5");
    expect(badge.className).toContain("text-xs");
  });

  it("applies md size styles by default", () => {
    render(<Badge>Medium</Badge>);
    const badge = screen.getByText("Medium");
    expect(badge.className).toContain("px-2.5");
    expect(badge.className).toContain("py-1");
    expect(badge.className).toContain("text-sm");
  });

  it("applies lg size styles", () => {
    render(<Badge size="lg">Large</Badge>);
    const badge = screen.getByText("Large");
    expect(badge.className).toContain("px-3");
    expect(badge.className).toContain("py-1.5");
    expect(badge.className).toContain("text-base");
  });

  it("applies rounded-full class when rounded is true", () => {
    render(<Badge rounded>Rounded</Badge>);
    expect(screen.getByText("Rounded").className).toContain("rounded-full");
  });

  it("applies rounded-md class by default (not rounded)", () => {
    render(<Badge>Not Rounded</Badge>);
    expect(screen.getByText("Not Rounded").className).toContain("rounded-md");
  });

  it("renders as a span element", () => {
    render(<Badge>Span</Badge>);
    expect(screen.getByText("Span").tagName).toBe("SPAN");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Badge ref={ref}>Ref</Badge>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });
});

describe("DifficultyBadge", () => {
  it("renders 'Easy' label for easy difficulty", () => {
    render(<DifficultyBadge difficulty="easy" />);
    expect(screen.getByText("Easy")).toBeInTheDocument();
  });

  it("renders 'Medium' label for medium difficulty", () => {
    render(<DifficultyBadge difficulty="medium" />);
    expect(screen.getByText("Medium")).toBeInTheDocument();
  });

  it("renders 'Hard' label for hard difficulty", () => {
    render(<DifficultyBadge difficulty="hard" />);
    expect(screen.getByText("Hard")).toBeInTheDocument();
  });

  it("applies success variant for easy difficulty", () => {
    render(<DifficultyBadge difficulty="easy" />);
    const badge = screen.getByText("Easy");
    expect(badge.className).toContain("bg-green-100");
    expect(badge.className).toContain("text-green-700");
  });

  it("applies warning variant for medium difficulty", () => {
    render(<DifficultyBadge difficulty="medium" />);
    const badge = screen.getByText("Medium");
    expect(badge.className).toContain("bg-yellow-100");
    expect(badge.className).toContain("text-yellow-700");
  });

  it("applies error variant for hard difficulty", () => {
    render(<DifficultyBadge difficulty="hard" />);
    const badge = screen.getByText("Hard");
    expect(badge.className).toContain("bg-red-100");
    expect(badge.className).toContain("text-red-700");
  });

  it("is always rounded", () => {
    render(<DifficultyBadge difficulty="easy" />);
    expect(screen.getByText("Easy").className).toContain("rounded-full");
  });

  it("renders custom children instead of default label", () => {
    render(<DifficultyBadge difficulty="easy">Beginner</DifficultyBadge>);
    expect(screen.getByText("Beginner")).toBeInTheDocument();
    expect(screen.queryByText("Easy")).not.toBeInTheDocument();
  });
});

describe("CategoryBadge", () => {
  it("renders category name", () => {
    render(<CategoryBadge category="Italian" />);
    expect(screen.getByText("Italian")).toBeInTheDocument();
  });

  it("applies primary variant", () => {
    render(<CategoryBadge category="Dessert" />);
    const badge = screen.getByText("Dessert");
    expect(badge.className).toContain("bg-orange-100");
    expect(badge.className).toContain("text-orange-700");
  });

  it("is always rounded", () => {
    render(<CategoryBadge category="Salad" />);
    expect(screen.getByText("Salad").className).toContain("rounded-full");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<CategoryBadge ref={ref} category="Soup" />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });
});
