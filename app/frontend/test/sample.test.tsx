import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

describe("Sample Test", () => {
  it("should pass a basic test", () => {
    expect(1 + 1).toBe(2);
  });

  it("should render a React component", () => {
    function TestComponent() {
      return <div>Hello, World!</div>;
    }

    render(<TestComponent />);
    expect(screen.getByText("Hello, World!")).toBeInTheDocument();
  });
});
