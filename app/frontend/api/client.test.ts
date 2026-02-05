import { describe, it, expect, beforeEach } from "vitest";
import {
  ApiClientError,
  getToken,
  setToken,
  removeToken,
  isAuthenticated,
  toApiFormat,
  fromApiFormat,
} from "./client";

const TOKEN_KEY = "auth_token";

describe("ApiClientError", () => {
  it("creates an error with message, status, and errors", () => {
    const error = new ApiClientError({
      message: "Validation failed",
      status: 422,
      errors: { email: ["is already taken"] },
    });

    expect(error.message).toBe("Validation failed");
    expect(error.status).toBe(422);
    expect(error.errors).toEqual({ email: ["is already taken"] });
  });

  it("has name set to 'ApiClientError'", () => {
    const error = new ApiClientError({
      message: "Not found",
      status: 404,
    });

    expect(error.name).toBe("ApiClientError");
  });

  it("is an instance of Error", () => {
    const error = new ApiClientError({
      message: "Server error",
      status: 500,
    });

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiClientError);
  });

  it("handles missing errors property", () => {
    const error = new ApiClientError({
      message: "Unauthorized",
      status: 401,
    });

    expect(error.errors).toBeUndefined();
  });

  it("has a stack trace", () => {
    const error = new ApiClientError({
      message: "Test error",
      status: 400,
    });

    expect(error.stack).toBeDefined();
  });
});

describe("token management", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("getToken", () => {
    it("returns null when no token is stored", () => {
      expect(getToken()).toBeNull();
    });

    it("returns the stored token", () => {
      localStorage.setItem(TOKEN_KEY, "my-jwt-token");

      expect(getToken()).toBe("my-jwt-token");
    });
  });

  describe("setToken", () => {
    it("stores the token in localStorage", () => {
      setToken("my-jwt-token");

      expect(localStorage.getItem(TOKEN_KEY)).toBe("my-jwt-token");
    });

    it("overwrites an existing token", () => {
      setToken("old-token");
      setToken("new-token");

      expect(localStorage.getItem(TOKEN_KEY)).toBe("new-token");
    });
  });

  describe("removeToken", () => {
    it("removes the token from localStorage", () => {
      localStorage.setItem(TOKEN_KEY, "my-jwt-token");

      removeToken();

      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    });

    it("does not throw when no token exists", () => {
      expect(() => removeToken()).not.toThrow();
    });
  });

  describe("isAuthenticated", () => {
    it("returns true when a token exists", () => {
      setToken("my-jwt-token");

      expect(isAuthenticated()).toBe(true);
    });

    it("returns false when no token exists", () => {
      expect(isAuthenticated()).toBe(false);
    });

    it("returns false after token is removed", () => {
      setToken("my-jwt-token");
      removeToken();

      expect(isAuthenticated()).toBe(false);
    });
  });
});

describe("toApiFormat", () => {
  it("converts camelCase keys to snake_case", () => {
    const input = { firstName: "John", lastName: "Doe" };
    const result = toApiFormat(input);

    expect(result).toEqual({ first_name: "John", last_name: "Doe" });
  });

  it("handles single-word keys (no conversion needed)", () => {
    const input = { name: "John", email: "john@example.com" };
    const result = toApiFormat(input);

    expect(result).toEqual({ name: "John", email: "john@example.com" });
  });

  it("handles nested objects", () => {
    const input = {
      userName: "john",
      profileData: {
        firstName: "John",
        lastName: "Doe",
        avatarUrl: "https://example.com/avatar.jpg",
      },
    };
    const result = toApiFormat(input);

    expect(result).toEqual({
      user_name: "john",
      profile_data: {
        first_name: "John",
        last_name: "Doe",
        avatar_url: "https://example.com/avatar.jpg",
      },
    });
  });

  it("handles arrays of objects", () => {
    const input = [
      { firstName: "John", lastName: "Doe" },
      { firstName: "Jane", lastName: "Smith" },
    ];
    const result = toApiFormat(input);

    expect(result).toEqual([
      { first_name: "John", last_name: "Doe" },
      { first_name: "Jane", last_name: "Smith" },
    ]);
  });

  it("handles arrays nested inside objects", () => {
    const input = {
      recipeIngredients: [
        { ingredientId: 1, unitPrice: 100 },
        { ingredientId: 2, unitPrice: 200 },
      ],
    };
    const result = toApiFormat(input);

    expect(result).toEqual({
      recipe_ingredients: [
        { ingredient_id: 1, unit_price: 100 },
        { ingredient_id: 2, unit_price: 200 },
      ],
    });
  });

  it("handles null", () => {
    expect(toApiFormat(null)).toBeNull();
  });

  it("handles undefined", () => {
    expect(toApiFormat(undefined)).toBeUndefined();
  });

  it("handles primitive values (strings)", () => {
    expect(toApiFormat("hello")).toBe("hello");
  });

  it("handles primitive values (numbers)", () => {
    expect(toApiFormat(42)).toBe(42);
  });

  it("handles primitive values (booleans)", () => {
    expect(toApiFormat(true)).toBe(true);
  });

  it("handles empty objects", () => {
    expect(toApiFormat({})).toEqual({});
  });

  it("handles empty arrays", () => {
    expect(toApiFormat([])).toEqual([]);
  });

  it("preserves non-object values inside objects", () => {
    const input = { matchPercentage: 85, isOptional: true, itemName: null };
    const result = toApiFormat(input);

    expect(result).toEqual({ match_percentage: 85, is_optional: true, item_name: null });
  });
});

describe("fromApiFormat", () => {
  it("converts snake_case keys to camelCase", () => {
    const input = { first_name: "John", last_name: "Doe" };
    const result = fromApiFormat(input);

    expect(result).toEqual({ firstName: "John", lastName: "Doe" });
  });

  it("handles single-word keys (no conversion needed)", () => {
    const input = { name: "John", email: "john@example.com" };
    const result = fromApiFormat(input);

    expect(result).toEqual({ name: "John", email: "john@example.com" });
  });

  it("handles nested objects", () => {
    const input = {
      user_name: "john",
      profile_data: {
        first_name: "John",
        last_name: "Doe",
        avatar_url: "https://example.com/avatar.jpg",
      },
    };
    const result = fromApiFormat(input);

    expect(result).toEqual({
      userName: "john",
      profileData: {
        firstName: "John",
        lastName: "Doe",
        avatarUrl: "https://example.com/avatar.jpg",
      },
    });
  });

  it("handles arrays of objects", () => {
    const input = [
      { first_name: "John", last_name: "Doe" },
      { first_name: "Jane", last_name: "Smith" },
    ];
    const result = fromApiFormat(input);

    expect(result).toEqual([
      { firstName: "John", lastName: "Doe" },
      { firstName: "Jane", lastName: "Smith" },
    ]);
  });

  it("handles arrays nested inside objects", () => {
    const input = {
      recipe_ingredients: [
        { ingredient_id: 1, unit_price: 100 },
        { ingredient_id: 2, unit_price: 200 },
      ],
    };
    const result = fromApiFormat(input);

    expect(result).toEqual({
      recipeIngredients: [
        { ingredientId: 1, unitPrice: 100 },
        { ingredientId: 2, unitPrice: 200 },
      ],
    });
  });

  it("handles null", () => {
    expect(fromApiFormat(null)).toBeNull();
  });

  it("handles undefined", () => {
    expect(fromApiFormat(undefined)).toBeUndefined();
  });

  it("handles primitive values", () => {
    expect(fromApiFormat("hello")).toBe("hello");
    expect(fromApiFormat(42)).toBe(42);
    expect(fromApiFormat(true)).toBe(true);
  });

  it("handles deeply nested structures", () => {
    const input = {
      top_level: {
        mid_level: {
          deep_value: "test",
          deep_array: [{ nested_key: "value" }],
        },
      },
    };
    const result = fromApiFormat(input);

    expect(result).toEqual({
      topLevel: {
        midLevel: {
          deepValue: "test",
          deepArray: [{ nestedKey: "value" }],
        },
      },
    });
  });
});
