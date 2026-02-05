import { describe, it, expect, vi, beforeEach } from "vitest";
import { listCategories, getCategory, createCategory, updateCategory, deleteCategory, categoriesApi } from "./categories";

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

describe("categories API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listCategories", () => {
    const mockCategories = [
      { id: 1, name: "Appetizers", position: 1, recipesCount: 5 },
      { id: 2, name: "Main Dishes", position: 2, recipesCount: 10 },
    ];

    it("calls apiClient.get with correct endpoint", async () => {
      mockGet.mockResolvedValue(mockCategories);

      await listCategories();

      expect(mockGet).toHaveBeenCalledWith("/categories", { params: undefined });
    });

    it("passes include_children param", async () => {
      mockGet.mockResolvedValue(mockCategories);

      await listCategories({ includeChildren: true });

      expect(mockGet).toHaveBeenCalledWith("/categories", { params: { includeChildren: true } });
    });

    it("returns categories list", async () => {
      mockGet.mockResolvedValue(mockCategories);

      const result = await listCategories();

      expect(result).toEqual(mockCategories);
    });
  });

  describe("getCategory", () => {
    it("calls apiClient.get with correct endpoint", async () => {
      mockGet.mockResolvedValue({ id: 1, name: "Appetizers" });

      await getCategory(1);

      expect(mockGet).toHaveBeenCalledWith("/categories/1");
    });
  });

  describe("createCategory", () => {
    it("calls apiClient.post with correct endpoint and data", async () => {
      const data = { name: "New Category", description: "desc" };
      mockPost.mockResolvedValue({ id: 1, ...data });

      await createCategory(data);

      expect(mockPost).toHaveBeenCalledWith("/categories", data);
    });
  });

  describe("updateCategory", () => {
    it("calls apiClient.put with correct endpoint and data", async () => {
      const data = { name: "Updated" };
      mockPut.mockResolvedValue({ id: 1, name: "Updated" });

      await updateCategory(1, data);

      expect(mockPut).toHaveBeenCalledWith("/categories/1", data);
    });
  });

  describe("deleteCategory", () => {
    it("calls apiClient.delete with correct endpoint", async () => {
      mockDelete.mockResolvedValue(undefined);

      await deleteCategory(3);

      expect(mockDelete).toHaveBeenCalledWith("/categories/3");
    });
  });

  describe("categoriesApi object", () => {
    it("exports all API functions", () => {
      expect(categoriesApi.list).toBe(listCategories);
      expect(categoriesApi.get).toBe(getCategory);
      expect(categoriesApi.create).toBe(createCategory);
      expect(categoriesApi.update).toBe(updateCategory);
      expect(categoriesApi.delete).toBe(deleteCategory);
    });
  });
});
