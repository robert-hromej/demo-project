import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("renders when isOpen is true", () => {
    render(
      <Modal isOpen onClose={vi.fn()}>
        Modal content
      </Modal>
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Modal content")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()}>
        Hidden content
      </Modal>
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByText("Hidden content")).not.toBeInTheDocument();
  });

  it("renders title", () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="My Modal">
        Content
      </Modal>
    );
    expect(screen.getByText("My Modal")).toBeInTheDocument();
    expect(screen.getByText("My Modal").tagName).toBe("H2");
  });

  it("renders description", () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="Title" description="A helpful description">
        Content
      </Modal>
    );
    expect(screen.getByText("A helpful description")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(
      <Modal isOpen onClose={handleClose} title="Title">
        Content
      </Modal>
    );
    await user.click(screen.getByLabelText("Close modal"));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose on Escape key press", () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen onClose={handleClose}>
        Content
      </Modal>
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose on Escape when closeOnEscape is false", () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen onClose={handleClose} closeOnEscape={false}>
        Content
      </Modal>
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(handleClose).not.toHaveBeenCalled();
  });

  it("renders footer", () => {
    render(
      <Modal
        isOpen
        onClose={vi.fn()}
        footer={<button>Save</button>}
      >
        Content
      </Modal>
    );
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("does not render footer when not provided", () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="Title">
        Content
      </Modal>
    );
    const dialog = screen.getByRole("dialog");
    // Footer wrapper has border-t class; ensure none exists when footer is omitted
    const borderTopElements = dialog.querySelectorAll(".border-t");
    expect(borderTopElements).toHaveLength(0);
  });

  it("has role='dialog' attribute", () => {
    render(
      <Modal isOpen onClose={vi.fn()}>
        Content
      </Modal>
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("has aria-modal='true' attribute", () => {
    render(
      <Modal isOpen onClose={vi.fn()}>
        Content
      </Modal>
    );
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });

  it("sets aria-labelledby when title is provided", () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="Named Modal">
        Content
      </Modal>
    );
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-labelledby", "modal-title");
    expect(screen.getByText("Named Modal")).toHaveAttribute("id", "modal-title");
  });

  it("does not set aria-labelledby when no title", () => {
    render(
      <Modal isOpen onClose={vi.fn()}>
        Content
      </Modal>
    );
    expect(screen.getByRole("dialog")).not.toHaveAttribute("aria-labelledby");
  });

  it("sets aria-describedby when description is provided", () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="T" description="Description text">
        Content
      </Modal>
    );
    expect(screen.getByRole("dialog")).toHaveAttribute(
      "aria-describedby",
      "modal-description"
    );
    expect(screen.getByText("Description text")).toHaveAttribute(
      "id",
      "modal-description"
    );
  });

  it("shows close button by default", () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="Title">
        Content
      </Modal>
    );
    expect(screen.getByLabelText("Close modal")).toBeInTheDocument();
  });

  it("hides close button when showCloseButton is false", () => {
    render(
      <Modal isOpen onClose={vi.fn()} showCloseButton={false}>
        Content
      </Modal>
    );
    expect(screen.queryByLabelText("Close modal")).not.toBeInTheDocument();
  });

  it("calls onClose on overlay click when closeOnOverlayClick is true", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(
      <Modal isOpen onClose={handleClose}>
        Content
      </Modal>
    );
    // The overlay is the div with aria-hidden="true"
    const overlay = screen.getByRole("dialog").querySelector('[aria-hidden="true"]');
    expect(overlay).toBeInTheDocument();
    await user.click(overlay!);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose on overlay click when closeOnOverlayClick is false", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(
      <Modal isOpen onClose={handleClose} closeOnOverlayClick={false}>
        Content
      </Modal>
    );
    const overlay = screen.getByRole("dialog").querySelector('[aria-hidden="true"]');
    expect(overlay).toBeInTheDocument();
    await user.click(overlay!);
    expect(handleClose).not.toHaveBeenCalled();
  });

  it("sets overflow hidden on body when open", () => {
    render(
      <Modal isOpen onClose={vi.fn()}>
        Content
      </Modal>
    );
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("restores body overflow on unmount", () => {
    const { unmount } = render(
      <Modal isOpen onClose={vi.fn()}>
        Content
      </Modal>
    );
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("forwards ref to the modal panel", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Modal ref={ref} isOpen onClose={vi.fn()}>
        Content
      </Modal>
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("renders via portal in document.body", () => {
    const { baseElement } = render(
      <Modal isOpen onClose={vi.fn()}>
        Portal content
      </Modal>
    );
    expect(baseElement.querySelector('[role="dialog"]')).toBeInTheDocument();
    expect(screen.getByText("Portal content")).toBeInTheDocument();
  });
});
