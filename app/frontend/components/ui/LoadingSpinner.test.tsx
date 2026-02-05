import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { LoadingSpinner, PageLoader, InlineLoader } from "./LoadingSpinner";

describe("LoadingSpinner", () => {
  it("renders with role='status'", () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("has aria-label 'Loading' by default", () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Loading");
  });

  it("renders custom label text visibly", () => {
    render(<LoadingSpinner label="Fetching data..." />);
    const texts = screen.getAllByText("Fetching data...");
    // One visible label span and one sr-only span
    const visibleLabel = texts.find((el) => !el.className.includes("sr-only"));
    expect(visibleLabel).toBeInTheDocument();
  });

  it("uses custom label for aria-label", () => {
    render(<LoadingSpinner label="Please wait" />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Please wait");
  });

  it("renders sr-only text with default 'Loading...'", () => {
    render(<LoadingSpinner />);
    const srOnly = screen.getByText("Loading...");
    expect(srOnly).toBeInTheDocument();
    expect(srOnly.className).toContain("sr-only");
  });

  it("renders sr-only text matching custom label", () => {
    render(<LoadingSpinner label="Saving..." />);
    // The sr-only text matches the label
    const srOnlyElements = screen.getAllByText("Saving...");
    const srOnly = srOnlyElements.find((el) => el.className.includes("sr-only"));
    expect(srOnly).toBeInTheDocument();
  });

  it("renders spinning animation element", () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("applies primary color by default", () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner?.getAttribute("class")).toContain("text-orange-500");
  });

  it("applies secondary color", () => {
    const { container } = render(<LoadingSpinner color="secondary" />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner?.getAttribute("class")).toContain("text-gray-500");
  });

  it("applies white color", () => {
    const { container } = render(<LoadingSpinner color="white" />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner?.getAttribute("class")).toContain("text-white");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<LoadingSpinner ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe("PageLoader", () => {
  it("renders with default label 'Loading...'", () => {
    render(<PageLoader />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    // Both visible label and sr-only text contain "Loading..."
    const loadingTexts = screen.getAllByText("Loading...");
    expect(loadingTexts.length).toBeGreaterThanOrEqual(1);
  });

  it("renders with overlay by default", () => {
    const { container } = render(<PageLoader />);
    const outerDiv = container.firstElementChild;
    expect(outerDiv?.className).toContain("fixed");
    expect(outerDiv?.className).toContain("inset-0");
    expect(outerDiv?.className).toContain("z-50");
  });

  it("renders without overlay when overlay is false", () => {
    const { container } = render(<PageLoader overlay={false} />);
    const outerDiv = container.firstElementChild;
    expect(outerDiv?.className).not.toContain("fixed");
    expect(outerDiv?.className).toContain("min-h-[200px]");
  });

  it("renders custom label", () => {
    render(<PageLoader label="Preparing..." />);
    // Both visible label and sr-only text contain "Preparing..."
    const texts = screen.getAllByText("Preparing...");
    expect(texts.length).toBeGreaterThanOrEqual(1);
  });

  it("uses xl size spinner", () => {
    const { container } = render(<PageLoader />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner?.getAttribute("class")).toContain("h-12");
    expect(spinner?.getAttribute("class")).toContain("w-12");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<PageLoader ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe("InlineLoader", () => {
  it("renders spinning animation element", () => {
    const { container } = render(<InlineLoader />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("renders as a span element", () => {
    const { container } = render(<InlineLoader />);
    expect(container.firstElementChild?.tagName).toBe("SPAN");
  });

  it("uses sm size by default", () => {
    const { container } = render(<InlineLoader />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner?.getAttribute("class")).toContain("h-3");
    expect(spinner?.getAttribute("class")).toContain("w-3");
  });

  it("uses md size", () => {
    const { container } = render(<InlineLoader size="md" />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner?.getAttribute("class")).toContain("h-4");
    expect(spinner?.getAttribute("class")).toContain("w-4");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<InlineLoader ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it("merges custom className", () => {
    const { container } = render(<InlineLoader className="extra-class" />);
    expect(container.firstElementChild?.className).toContain("extra-class");
  });
});
