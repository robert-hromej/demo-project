import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { Input } from "./Input";

describe("Input", () => {
  it("renders with placeholder", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("renders label with htmlFor linked to input", () => {
    render(<Input label="Email" id="email-field" />);
    const label = screen.getByText("Email");
    expect(label).toBeInTheDocument();
    expect(label.tagName).toBe("LABEL");
    expect(label).toHaveAttribute("for", "email-field");
    expect(screen.getByRole("textbox")).toHaveAttribute("id", "email-field");
  });

  it("generates an auto id when no id is provided and links label", () => {
    render(<Input label="Username" />);
    const label = screen.getByText("Username");
    const input = screen.getByRole("textbox");
    const labelFor = label.getAttribute("for");
    expect(labelFor).toBeTruthy();
    expect(input.getAttribute("id")).toBe(labelFor);
  });

  it("shows error message with role='alert'", () => {
    render(<Input error="This field is required" />);
    const errorMessage = screen.getByRole("alert");
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveTextContent("This field is required");
  });

  it("shows hint text when no error is present", () => {
    render(<Input hint="Enter your full name" />);
    expect(screen.getByText("Enter your full name")).toBeInTheDocument();
  });

  it("does not show hint when error is present", () => {
    render(<Input hint="Helpful hint" error="Something went wrong" />);
    expect(screen.queryByText("Helpful hint")).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong");
  });

  it("renders leftIcon", () => {
    render(<Input leftIcon={<span data-testid="left-icon">L</span>} />);
    expect(screen.getByTestId("left-icon")).toBeInTheDocument();
  });

  it("renders rightIcon", () => {
    render(<Input rightIcon={<span data-testid="right-icon">R</span>} />);
    expect(screen.getByTestId("right-icon")).toBeInTheDocument();
  });

  it("applies padding class for leftIcon", () => {
    render(<Input leftIcon={<span>L</span>} />);
    expect(screen.getByRole("textbox").className).toContain("pl-10");
  });

  it("applies padding class for rightIcon", () => {
    render(<Input rightIcon={<span>R</span>} />);
    expect(screen.getByRole("textbox").className).toContain("pr-10");
  });

  it("applies aria-invalid when error is present", () => {
    render(<Input error="Invalid" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("does not apply aria-invalid when no error", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "false");
  });

  it("links aria-describedby to the error message", () => {
    render(<Input id="test-input" error="Error text" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-describedby", "test-input-error");
  });

  it("links aria-describedby to the hint text", () => {
    render(<Input id="test-input" hint="Hint text" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-describedby", "test-input-hint");
  });

  it("applies disabled state to the input", () => {
    render(<Input disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("applies disabled style classes", () => {
    render(<Input disabled />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("bg-gray-50");
    expect(input.className).toContain("cursor-not-allowed");
  });

  it("applies fullWidth class by default", () => {
    render(<Input />);
    expect(screen.getByRole("textbox").className).toContain("w-full");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("calls onChange handler", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    await user.type(screen.getByRole("textbox"), "a");
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("accepts typed text", async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Type here" />);
    const input = screen.getByPlaceholderText("Type here");
    await user.type(input, "hello");
    expect(input).toHaveValue("hello");
  });
});
