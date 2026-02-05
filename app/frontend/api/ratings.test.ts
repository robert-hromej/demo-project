import { describe, it, expect, vi, beforeEach } from "vitest";
import { listRatings, createRating, deleteRating, ratingsApi } from "./ratings";

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockDelete = vi.fn();

vi.mock("./client", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}));

describe("ratings API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listRatings", () => {
    const mockResponse = {
      data: [{ id: 1, score: 5, review: "Great!", user: { id: 1, name: "User" } }],
      meta: { currentPage: 1, totalPages: 1, totalCount: 1, perPage: 20, averageScore: 5 },
    };

    it("calls apiClient.get with correct endpoint", async () => {
      mockGet.mockResolvedValue(mockResponse);

      await listRatings(42);

      expect(mockGet).toHaveBeenCalledWith("/recipes/42/ratings", { params: undefined });
    });

    it("passes pagination params", async () => {
      mockGet.mockResolvedValue(mockResponse);

      await listRatings(42, { page: 2, perPage: 5 });

      expect(mockGet).toHaveBeenCalledWith("/recipes/42/ratings", {
        params: { page: 2, perPage: 5 },
      });
    });

    it("returns ratings response", async () => {
      mockGet.mockResolvedValue(mockResponse);

      const result = await listRatings(1);

      expect(result).toEqual(mockResponse);
    });
  });

  describe("createRating", () => {
    it("calls apiClient.post with correct endpoint and data", async () => {
      const data = { score: 5, review: "Excellent!" };
      mockPost.mockResolvedValue({ id: 1, ...data });

      await createRating(42, data);

      expect(mockPost).toHaveBeenCalledWith("/recipes/42/ratings", data);
    });

    it("creates rating without review", async () => {
      const data = { score: 4 };
      mockPost.mockResolvedValue({ id: 1, score: 4, review: null });

      await createRating(42, data);

      expect(mockPost).toHaveBeenCalledWith("/recipes/42/ratings", { score: 4 });
    });
  });

  describe("deleteRating", () => {
    it("calls apiClient.delete with correct endpoint", async () => {
      mockDelete.mockResolvedValue(undefined);

      await deleteRating(42);

      expect(mockDelete).toHaveBeenCalledWith("/recipes/42/ratings");
    });
  });

  describe("ratingsApi object", () => {
    it("exports all API functions", () => {
      expect(ratingsApi.list).toBe(listRatings);
      expect(ratingsApi.create).toBe(createRating);
      expect(ratingsApi.delete).toBe(deleteRating);
    });
  });
});
