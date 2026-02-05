import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HomePage from "./HomePage";

function renderPage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );
}

describe("HomePage", () => {
  it("renders welcome heading", () => {
    renderPage();

    expect(screen.getByText("RecipeMatch")).toBeInTheDocument();
    expect(screen.getByText(/Welcome to/)).toBeInTheDocument();
  });

  it("renders hero description", () => {
    renderPage();

    expect(
      screen.getByText(/Find the perfect recipe based on what you have/)
    ).toBeInTheDocument();
  });

  it("renders Search by Ingredients feature card", () => {
    renderPage();

    // Text appears in hero button AND feature card
    expect(screen.getAllByText("Search by Ingredients").length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText(/Enter the ingredients you have on hand/)
    ).toBeInTheDocument();
  });

  it("renders Search by Budget feature card", () => {
    renderPage();

    expect(screen.getByText("Search by Budget")).toBeInTheDocument();
    expect(
      screen.getByText(/Set your budget and discover delicious meals/)
    ).toBeInTheDocument();
  });

  it("renders Browse Recipes feature card", () => {
    renderPage();

    // Text appears in hero button AND feature card
    expect(screen.getAllByText("Browse Recipes").length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText(/Explore our collection of recipes/)
    ).toBeInTheDocument();
  });

  it("renders How It Works section", () => {
    renderPage();

    expect(screen.getByText("How It Works")).toBeInTheDocument();
  });

  it("renders Why RecipeMatch section", () => {
    renderPage();

    expect(screen.getByText("Why RecipeMatch?")).toBeInTheDocument();
  });

  it("renders highlights", () => {
    renderPage();

    expect(screen.getByText("Quick & Easy")).toBeInTheDocument();
    expect(screen.getByText("Community Rated")).toBeInTheDocument();
    expect(screen.getByText("Cost Estimates")).toBeInTheDocument();
  });

  it("renders CTA section", () => {
    renderPage();

    expect(screen.getByText("Ready to Start Cooking?")).toBeInTheDocument();
  });

  it("has link to /search/ingredients", () => {
    renderPage();

    const links = screen.getAllByRole("link");
    const ingredientLinks = links.filter((link) =>
      link.getAttribute("href")?.includes("/search/ingredients")
    );
    expect(ingredientLinks.length).toBeGreaterThan(0);
  });

  it("has link to /recipes", () => {
    renderPage();

    const links = screen.getAllByRole("link");
    const recipeLinks = links.filter((link) =>
      link.getAttribute("href")?.includes("/recipes")
    );
    expect(recipeLinks.length).toBeGreaterThan(0);
  });

  it("has link to /register", () => {
    renderPage();

    const links = screen.getAllByRole("link");
    const registerLinks = links.filter((link) =>
      link.getAttribute("href")?.includes("/register")
    );
    expect(registerLinks.length).toBeGreaterThan(0);
  });
});
