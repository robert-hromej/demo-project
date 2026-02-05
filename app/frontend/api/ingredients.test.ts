import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listIngredients,
  searchIngredients,
  getIngredient,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  ingredientsApi,
} from "./ingredients";

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

describe("ingredients API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPaginatedResponse = {
    data: [{ id: 1, name: "Tomato", nameUk: "Pomidor" }],
    meta: { currentPage: 1, totalPages: 1, totalCount: 1, perPage: 20 },
  };

  describe("listIngredients", () => {
    it("calls apiClient.get with correct endpoint", async () => {
      mockGet.mockResolvedValue(mockPaginatedResponse);

      await listIngredients();

      expect(mockGet).toHaveBeenCalledWith("/ingredients", { params: undefined });
    });

    it("passes search params", async () => {
      mockGet.mockResolvedValue(mockPaginatedResponse);

      await listIngredients({ query: "tom", category: "vegetables" });

      expect(mockGet).toHaveBeenCalledWith("/ingredients", {
        params: { query: "tom", category: "vegetables" },
      });
    });
  });

  describe("searchIngredients", () => {
    it("delegates to listIngredients with query", async () => {
      mockGet.mockResolvedValue(mockPaginatedResponse);

      await searchIngredients("tomato", { category: "vegetables" });

      expect(mockGet).toHaveBeenCalledWith("/ingredients", {
        params: { query: "tomato", category: "vegetables" },
      });
    });
  });

  describe("getIngredient", () => {
    it("calls apiClient.get with correct endpoint", async () => {
      mockGet.mockResolvedValue({ id: 1, name: "Tomato" });

      await getIngredient(1);

      expect(mockGet).toHaveBeenCalledWith("/ingredients/1");
    });
  });

  describe("createIngredient", () => {
    it("calls apiClient.post with correct endpoint and data", async () => {
      const data = { name: "Garlic", nameUk: "Chasnik" };
      mockPost.mockResolvedValue({ id: 1, ...data });

      await createIngredient(data);

      expect(mockPost).toHaveBeenCalledWith("/ingredients", data);
    });
  });

  describe("updateIngredient", () => {
    it("calls apiClient.put with correct endpoint and data", async () => {
      const data = { name: "Updated Garlic" };
      mockPut.mockResolvedValue({ id: 1, name: "Updated Garlic" });

      await updateIngredient(1, data);

      expect(mockPut).toHaveBeenCalledWith("/ingredients/1", data);
    });
  });

  describe("deleteIngredient", () => {
    it("calls apiClient.delete with correct endpoint", async () => {
      mockDelete.mockResolvedValue(undefined);

      await deleteIngredient(5);

      expect(mockDelete).toHaveBeenCalledWith("/ingredients/5");
    });
  });

  describe("ingredientsApi object", () => {
    it("exports all API functions", () => {
      expect(ingredientsApi.list).toBe(listIngredients);
      expect(ingredientsApi.search).toBe(searchIngredients);
      expect(ingredientsApi.get).toBe(getIngredient);
      expect(ingredientsApi.create).toBe(createIngredient);
      expect(ingredientsApi.update).toBe(updateIngredient);
      expect(ingredientsApi.delete).toBe(deleteIngredient);
    });
  });
});
