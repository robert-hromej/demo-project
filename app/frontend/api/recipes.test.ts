import { describe, it, expect, vi, beforeEach } from "vitest";
import { listRecipes, searchRecipes, getRecipe, createRecipe, updateRecipe, deleteRecipe, recipesApi } from "./recipes";

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();
const mockDelete = vi.fn();

vi.mock("./client", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    put: (...args: unknown[]) => mockPut(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}));

describe("recipes API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listRecipes", () => {
    const mockResponse = {
      data: [{ id: 1, title: "Pasta" }],
      meta: { currentPage: 1, totalPages: 1, totalCount: 1, perPage: 20 },
    };

    it("calls apiClient.get with correct endpoint", async () => {
      mockGet.mockResolvedValue(mockResponse);

      await listRecipes();

      expect(mockGet).toHaveBeenCalledWith("/recipes", { params: undefined });
    });

    it("passes search params", async () => {
      mockGet.mockResolvedValue(mockResponse);
      const params = { query: "pasta", difficulty: "easy" as const, page: 1 };

      await listRecipes(params);

      expect(mockGet).toHaveBeenCalledWith("/recipes", { params });
    });

    it("returns paginated response", async () => {
      mockGet.mockResolvedValue(mockResponse);

      const result = await listRecipes();

      expect(result).toEqual(mockResponse);
    });
  });

  describe("searchRecipes", () => {
    it("delegates to listRecipes with query param", async () => {
      const mockResponse = { data: [], meta: { currentPage: 1, totalPages: 0, totalCount: 0, perPage: 20 } };
      mockGet.mockResolvedValue(mockResponse);

      await searchRecipes("pasta", { difficulty: "easy" });

      expect(mockGet).toHaveBeenCalledWith("/recipes", {
        params: { query: "pasta", difficulty: "easy" },
      });
    });
  });

  describe("getRecipe", () => {
    it("calls apiClient.get with correct endpoint", async () => {
      const mockRecipe = { id: 1, title: "Pasta" };
      mockGet.mockResolvedValue(mockRecipe);

      await getRecipe(1);

      expect(mockGet).toHaveBeenCalledWith("/recipes/1");
    });

    it("returns the recipe", async () => {
      const mockRecipe = { id: 42, title: "Soup" };
      mockGet.mockResolvedValue(mockRecipe);

      const result = await getRecipe(42);

      expect(result).toEqual(mockRecipe);
    });
  });

  describe("createRecipe", () => {
    const recipeData = {
      title: "New Recipe",
      instructions: "Step 1",
      prepTimeMin: 10,
      cookTimeMin: 20,
    };

    it("calls apiClient.post with correct endpoint and data", async () => {
      mockPost.mockResolvedValue({ id: 1, ...recipeData });

      await createRecipe(recipeData);

      expect(mockPost).toHaveBeenCalledWith("/recipes", recipeData);
    });

    it("returns the created recipe", async () => {
      const created = { id: 1, ...recipeData };
      mockPost.mockResolvedValue(created);

      const result = await createRecipe(recipeData);

      expect(result).toEqual(created);
    });
  });

  describe("updateRecipe", () => {
    it("calls apiClient.put with correct endpoint and data", async () => {
      const updateData = { title: "Updated" };
      mockPut.mockResolvedValue({ id: 1, title: "Updated" });

      await updateRecipe(1, updateData);

      expect(mockPut).toHaveBeenCalledWith("/recipes/1", updateData);
    });
  });

  describe("deleteRecipe", () => {
    it("calls apiClient.delete with correct endpoint", async () => {
      mockDelete.mockResolvedValue(undefined);

      await deleteRecipe(5);

      expect(mockDelete).toHaveBeenCalledWith("/recipes/5");
    });
  });

  describe("recipesApi object", () => {
    it("exports all API functions", () => {
      expect(recipesApi.list).toBe(listRecipes);
      expect(recipesApi.search).toBe(searchRecipes);
      expect(recipesApi.get).toBe(getRecipe);
      expect(recipesApi.create).toBe(createRecipe);
      expect(recipesApi.update).toBe(updateRecipe);
      expect(recipesApi.delete).toBe(deleteRecipe);
    });
  });
});
