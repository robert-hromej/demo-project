import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { Card, CardHeader, CardBody, CardFooter } from "./Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("applies no padding by default", () => {
    render(<Card data-testid="card">Content</Card>);
    const card = screen.getByTestId("card");
    expect(card.className).not.toContain("p-4");
    expect(card.className).not.toContain("p-6");
    expect(card.className).not.toContain("p-8");
  });

  it("applies sm padding", () => {
    render(<Card padding="sm" data-testid="card">Content</Card>);
    expect(screen.getByTestId("card").className).toContain("p-4");
  });

  it("applies md padding", () => {
    render(<Card padding="md" data-testid="card">Content</Card>);
    expect(screen.getByTestId("card").className).toContain("p-6");
  });

  it("applies lg padding", () => {
    render(<Card padding="lg" data-testid="card">Content</Card>);
    expect(screen.getByTestId("card").className).toContain("p-8");
  });

  it("applies base card styles", () => {
    render(<Card data-testid="card">Content</Card>);
    const card = screen.getByTestId("card");
    expect(card.className).toContain("rounded-xl");
    expect(card.className).toContain("border");
    expect(card.className).toContain("bg-white");
    expect(card.className).toContain("shadow-sm");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Card ref={ref}>Content</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("merges custom className", () => {
    render(<Card className="custom-class" data-testid="card">Content</Card>);
    expect(screen.getByTestId("card").className).toContain("custom-class");
  });
});

describe("CardHeader", () => {
  it("renders title", () => {
    render(<CardHeader title="My Title" />);
    expect(screen.getByText("My Title")).toBeInTheDocument();
    expect(screen.getByText("My Title").tagName).toBe("H3");
  });

  it("renders description", () => {
    render(<CardHeader title="Title" description="Some description" />);
    expect(screen.getByText("Some description")).toBeInTheDocument();
  });

  it("renders title and description together", () => {
    render(<CardHeader title="Header" description="Subtitle text" />);
    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Subtitle text")).toBeInTheDocument();
  });

  it("renders action slot", () => {
    render(
      <CardHeader
        title="Title"
        action={<button data-testid="action-btn">Action</button>}
      />
    );
    expect(screen.getByTestId("action-btn")).toBeInTheDocument();
  });

  it("renders children instead of title/description/action when provided", () => {
    render(
      <CardHeader title="Ignored Title">
        <span>Custom Header Content</span>
      </CardHeader>
    );
    expect(screen.getByText("Custom Header Content")).toBeInTheDocument();
    expect(screen.queryByText("Ignored Title")).not.toBeInTheDocument();
  });

  it("applies border-b style", () => {
    render(<CardHeader data-testid="header" title="T" />);
    expect(screen.getByTestId("header").className).toContain("border-b");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<CardHeader ref={ref} title="T" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe("CardBody", () => {
  it("renders children", () => {
    render(<CardBody>Body content here</CardBody>);
    expect(screen.getByText("Body content here")).toBeInTheDocument();
  });

  it("applies p-6 padding", () => {
    render(<CardBody data-testid="body">Content</CardBody>);
    expect(screen.getByTestId("body").className).toContain("p-6");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<CardBody ref={ref}>Content</CardBody>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("merges custom className", () => {
    render(<CardBody className="extra" data-testid="body">Content</CardBody>);
    expect(screen.getByTestId("body").className).toContain("extra");
  });
});

describe("CardFooter", () => {
  it("renders children", () => {
    render(<CardFooter>Footer content</CardFooter>);
    expect(screen.getByText("Footer content")).toBeInTheDocument();
  });

  it("applies right alignment by default", () => {
    render(<CardFooter data-testid="footer">Content</CardFooter>);
    expect(screen.getByTestId("footer").className).toContain("justify-end");
  });

  it("applies left alignment", () => {
    render(<CardFooter align="left" data-testid="footer">Content</CardFooter>);
    expect(screen.getByTestId("footer").className).toContain("justify-start");
  });

  it("applies center alignment", () => {
    render(<CardFooter align="center" data-testid="footer">Content</CardFooter>);
    expect(screen.getByTestId("footer").className).toContain("justify-center");
  });

  it("applies between alignment", () => {
    render(<CardFooter align="between" data-testid="footer">Content</CardFooter>);
    expect(screen.getByTestId("footer").className).toContain("justify-between");
  });

  it("applies border-t style", () => {
    render(<CardFooter data-testid="footer">Content</CardFooter>);
    expect(screen.getByTestId("footer").className).toContain("border-t");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<CardFooter ref={ref}>Content</CardFooter>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
