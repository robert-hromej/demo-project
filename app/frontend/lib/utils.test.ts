import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("merges multiple class names", () => {
    expect(cn("foo", "bar", "baz")).toBe("foo bar baz");
  });

  it("handles conditional classes with logical AND", () => {
    const isActive = true;
    const isHidden = false;
    expect(cn("base", isActive && "active")).toBe("base active");
    expect(cn("base", isHidden && "active")).toBe("base");
  });

  it("handles conditional classes with ternary", () => {
    const isActive = true;
    expect(cn("base", isActive ? "active" : "inactive")).toBe("base active");
  });

  it("handles undefined values", () => {
    expect(cn("foo", undefined, "bar")).toBe("foo bar");
  });

  it("handles null values", () => {
    expect(cn("foo", null, "bar")).toBe("foo bar");
  });

  it("handles false values", () => {
    expect(cn("foo", false, "bar")).toBe("foo bar");
  });

  it("handles empty string values", () => {
    expect(cn("foo", "", "bar")).toBe("foo bar");
  });

  it("handles object syntax for conditional classes", () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
  });

  it("handles array syntax", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });

  it("merges conflicting tailwind padding classes (last wins)", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
  });

  it("merges conflicting tailwind margin classes", () => {
    expect(cn("m-4", "m-8")).toBe("m-8");
  });

  it("merges conflicting tailwind text color classes", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("merges conflicting tailwind background classes", () => {
    expect(cn("bg-white", "bg-gray-100")).toBe("bg-gray-100");
  });

  it("keeps non-conflicting tailwind classes", () => {
    expect(cn("p-4", "m-2", "text-lg")).toBe("p-4 m-2 text-lg");
  });

  it("handles mixed conditional and tailwind merge", () => {
    const isLarge = true;
    expect(cn("p-2", isLarge && "p-4")).toBe("p-4");
  });

  it("returns empty string for no arguments", () => {
    expect(cn()).toBe("");
  });

  it("returns empty string for all falsy arguments", () => {
    expect(cn(false, null, undefined, "")).toBe("");
  });
});
