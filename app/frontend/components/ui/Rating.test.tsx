import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { Rating, InteractiveRating } from "./Rating";

describe("Rating", () => {
  it("renders correct aria-label with value and maxValue", () => {
    render(<Rating value={3.5} />);
    expect(screen.getByLabelText("Rating: 3.5 out of 5 stars")).toBeInTheDocument();
  });

  it("renders correct aria-label with custom maxValue", () => {
    render(<Rating value={7} maxValue={10} />);
    expect(screen.getByLabelText("Rating: 7 out of 10 stars")).toBeInTheDocument();
  });

  it("clamps value to maxValue", () => {
    render(<Rating value={8} maxValue={5} />);
    expect(screen.getByLabelText("Rating: 5 out of 5 stars")).toBeInTheDocument();
  });

  it("clamps negative value to 0", () => {
    render(<Rating value={-2} />);
    expect(screen.getByLabelText("Rating: 0 out of 5 stars")).toBeInTheDocument();
  });

  it("shows value text when showValue is true", () => {
    render(<Rating value={4.5} showValue />);
    expect(screen.getByText("4.5")).toBeInTheDocument();
  });

  it("does not show value text when showValue is false", () => {
    render(<Rating value={4.5} />);
    expect(screen.queryByText("4.5")).not.toBeInTheDocument();
  });

  it("shows review count", () => {
    render(<Rating value={3} reviewCount={42} />);
    expect(screen.getByText("(42)")).toBeInTheDocument();
  });

  it("shows both value and review count together", () => {
    render(<Rating value={3.5} showValue reviewCount={100} />);
    expect(screen.getByText("3.5")).toBeInTheDocument();
    expect(screen.getByText("(100)")).toBeInTheDocument();
  });

  it("shows review count of 0", () => {
    render(<Rating value={0} reviewCount={0} />);
    expect(screen.getByText("(0)")).toBeInTheDocument();
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Rating ref={ref} value={3} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe("InteractiveRating", () => {
  it("renders correct number of star buttons", () => {
    render(<InteractiveRating value={0} onChange={vi.fn()} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(5);
  });

  it("renders correct number of star buttons with custom maxValue", () => {
    render(<InteractiveRating value={0} onChange={vi.fn()} maxValue={10} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(10);
  });

  it("calls onChange with star value on click", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<InteractiveRating value={0} onChange={handleChange} />);
    const buttons = screen.getAllByRole("button");
    await user.click(buttons[2]!);
    expect(handleChange).toHaveBeenCalledWith(3);
  });

  it("calls onChange with correct value for each star", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<InteractiveRating value={0} onChange={handleChange} />);
    const buttons = screen.getAllByRole("button");
    await user.click(buttons[0]!);
    expect(handleChange).toHaveBeenCalledWith(1);
    await user.click(buttons[4]!);
    expect(handleChange).toHaveBeenCalledWith(5);
  });

  it("has correct aria-label on each star button", () => {
    render(<InteractiveRating value={0} onChange={vi.fn()} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toHaveAttribute("aria-label", "Rate 1 out of 5 stars");
    expect(buttons[4]).toHaveAttribute("aria-label", "Rate 5 out of 5 stars");
  });

  it("does not call onChange when disabled", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<InteractiveRating value={0} onChange={handleChange} disabled />);
    const buttons = screen.getAllByRole("button");
    await user.click(buttons[2]!);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("applies opacity when disabled", () => {
    render(
      <InteractiveRating
        value={0}
        onChange={vi.fn()}
        disabled
        data-testid="rating"
      />
    );
    expect(screen.getByTestId("rating").className).toContain("opacity-50");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<InteractiveRating ref={ref} value={0} onChange={vi.fn()} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
