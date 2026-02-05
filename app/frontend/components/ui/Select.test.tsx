import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { Select } from "./Select";

const defaultOptions = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
];

describe("Select", () => {
  it("renders options", () => {
    render(<Select options={defaultOptions} />);
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("Banana")).toBeInTheDocument();
    expect(screen.getByText("Cherry")).toBeInTheDocument();
  });

  it("renders label linked to the select", () => {
    render(<Select label="Fruit" options={defaultOptions} id="fruit-select" />);
    const label = screen.getByText("Fruit");
    expect(label).toBeInTheDocument();
    expect(label.tagName).toBe("LABEL");
    expect(label).toHaveAttribute("for", "fruit-select");
  });

  it("generates an auto id and links label", () => {
    render(<Select label="Category" options={defaultOptions} />);
    const label = screen.getByText("Category");
    const select = screen.getByRole("combobox");
    expect(label.getAttribute("for")).toBe(select.getAttribute("id"));
  });

  it("shows placeholder option as disabled", () => {
    render(<Select options={defaultOptions} placeholder="Choose a fruit" />);
    const placeholder = screen.getByText("Choose a fruit");
    expect(placeholder.tagName).toBe("OPTION");
    expect(placeholder).toBeDisabled();
    expect(placeholder).toHaveAttribute("value", "");
  });

  it("shows error with role='alert'", () => {
    render(<Select options={defaultOptions} error="Selection is required" />);
    const errorMessage = screen.getByRole("alert");
    expect(errorMessage).toHaveTextContent("Selection is required");
  });

  it("shows hint text when no error is present", () => {
    render(<Select options={defaultOptions} hint="Pick your favorite" />);
    expect(screen.getByText("Pick your favorite")).toBeInTheDocument();
  });

  it("does not show hint when error is present", () => {
    render(
      <Select options={defaultOptions} hint="Pick your favorite" error="Required" />
    );
    expect(screen.queryByText("Pick your favorite")).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Required");
  });

  it("applies aria-invalid when error is present", () => {
    render(<Select options={defaultOptions} error="Invalid" />);
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true");
  });

  it("applies disabled state", () => {
    render(<Select options={defaultOptions} disabled />);
    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("applies disabled style classes", () => {
    render(<Select options={defaultOptions} disabled />);
    const select = screen.getByRole("combobox");
    expect(select.className).toContain("bg-gray-50");
    expect(select.className).toContain("cursor-not-allowed");
  });

  it("renders disabled options", () => {
    const options = [
      { value: "active", label: "Active" },
      { value: "disabled", label: "Disabled Option", disabled: true },
    ];
    render(<Select options={options} />);
    expect(screen.getByText("Disabled Option")).toBeDisabled();
  });

  it("calls onChange handler when selection changes", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Select options={defaultOptions} onChange={handleChange} />);
    await user.selectOptions(screen.getByRole("combobox"), "banana");
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLSelectElement>();
    render(<Select ref={ref} options={defaultOptions} />);
    expect(ref.current).toBeInstanceOf(HTMLSelectElement);
  });

  it("applies fullWidth class by default", () => {
    render(<Select options={defaultOptions} />);
    expect(screen.getByRole("combobox").className).toContain("w-full");
  });

  it("links aria-describedby to error message", () => {
    render(<Select id="sel" options={defaultOptions} error="Err" />);
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-describedby", "sel-error");
  });

  it("links aria-describedby to hint text", () => {
    render(<Select id="sel" options={defaultOptions} hint="Hint" />);
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-describedby", "sel-hint");
  });
});
