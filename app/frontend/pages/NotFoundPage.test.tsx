import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import NotFoundPage from "./NotFoundPage";

function renderPage() {
  return render(
    <MemoryRouter>
      <NotFoundPage />
    </MemoryRouter>
  );
}

describe("NotFoundPage", () => {
  it("renders 404 heading", () => {
    renderPage();

    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("renders Page Not Found text", () => {
    renderPage();

    expect(screen.getByText("Page Not Found")).toBeInTheDocument();
  });

  it("renders description text", () => {
    renderPage();

    expect(
      screen.getByText(/The page you are looking for does not exist/)
    ).toBeInTheDocument();
  });

  it("renders Go Home link pointing to /", () => {
    renderPage();

    const link = screen.getByText("Go Home").closest("a");
    expect(link).toHaveAttribute("href", "/");
  });

  it("renders Go Back button", () => {
    renderPage();

    expect(screen.getByText("Go Back")).toBeInTheDocument();
  });

  it("calls history.back when Go Back is clicked", async () => {
    const user = userEvent.setup();
    const historyBack = vi.spyOn(window.history, "back").mockImplementation(() => {});

    renderPage();
    await user.click(screen.getByText("Go Back"));

    expect(historyBack).toHaveBeenCalled();
    historyBack.mockRestore();
  });
});
