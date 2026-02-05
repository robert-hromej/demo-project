import { describe, it, expect, vi, beforeEach } from "vitest";
import { register, login, getMe, logout, authApi } from "./auth";

const mockPost = vi.fn();
const mockGet = vi.fn();
const mockSetToken = vi.fn();
const mockRemoveToken = vi.fn();

vi.mock("./client", () => ({
  apiClient: {
    post: (...args: unknown[]) => mockPost(...args),
    get: (...args: unknown[]) => mockGet(...args),
  },
  setToken: (...args: unknown[]) => mockSetToken(...args),
  removeToken: (...args: unknown[]) => mockRemoveToken(...args),
}));

describe("auth API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("register", () => {
    const registerData = {
      email: "test@example.com",
      password: "password123",
      passwordConfirmation: "password123",
      name: "Test User",
    };

    const mockResponse = {
      user: { id: 1, email: "test@example.com", name: "Test User", avatarUrl: null, createdAt: "2025-01-01" },
      token: "jwt-token-123",
    };

    it("calls apiClient.post with correct endpoint and data", async () => {
      mockPost.mockResolvedValue(mockResponse);

      await register(registerData);

      expect(mockPost).toHaveBeenCalledWith("/auth/register", registerData);
    });

    it("stores token on successful registration", async () => {
      mockPost.mockResolvedValue(mockResponse);

      await register(registerData);

      expect(mockSetToken).toHaveBeenCalledWith("jwt-token-123");
    });

    it("returns the auth response", async () => {
      mockPost.mockResolvedValue(mockResponse);

      const result = await register(registerData);

      expect(result).toEqual(mockResponse);
    });

    it("does not store token when response has no token", async () => {
      mockPost.mockResolvedValue({ user: mockResponse.user });

      await register(registerData);

      expect(mockSetToken).not.toHaveBeenCalled();
    });

    it("propagates API errors", async () => {
      mockPost.mockRejectedValue(new Error("Email already taken"));

      await expect(register(registerData)).rejects.toThrow("Email already taken");
    });
  });

  describe("login", () => {
    const loginData = { email: "test@example.com", password: "password123" };
    const mockResponse = {
      user: { id: 1, email: "test@example.com", name: "Test User", avatarUrl: null, createdAt: "2025-01-01" },
      token: "jwt-token-456",
    };

    it("calls apiClient.post with correct endpoint and data", async () => {
      mockPost.mockResolvedValue(mockResponse);

      await login(loginData);

      expect(mockPost).toHaveBeenCalledWith("/auth/login", loginData);
    });

    it("stores token on successful login", async () => {
      mockPost.mockResolvedValue(mockResponse);

      await login(loginData);

      expect(mockSetToken).toHaveBeenCalledWith("jwt-token-456");
    });

    it("returns the auth response", async () => {
      mockPost.mockResolvedValue(mockResponse);

      const result = await login(loginData);

      expect(result).toEqual(mockResponse);
    });

    it("propagates API errors", async () => {
      mockPost.mockRejectedValue(new Error("Invalid credentials"));

      await expect(login(loginData)).rejects.toThrow("Invalid credentials");
    });
  });

  describe("getMe", () => {
    const mockUser = { id: 1, email: "test@example.com", name: "Test User", avatarUrl: null, createdAt: "2025-01-01" };

    it("calls apiClient.get with correct endpoint", async () => {
      mockGet.mockResolvedValue(mockUser);

      await getMe();

      expect(mockGet).toHaveBeenCalledWith("/auth/me");
    });

    it("returns the user data", async () => {
      mockGet.mockResolvedValue(mockUser);

      const result = await getMe();

      expect(result).toEqual(mockUser);
    });
  });

  describe("logout", () => {
    it("removes the token", () => {
      logout();

      expect(mockRemoveToken).toHaveBeenCalled();
    });
  });

  describe("authApi object", () => {
    it("exports all API functions", () => {
      expect(authApi.register).toBe(register);
      expect(authApi.login).toBe(login);
      expect(authApi.getMe).toBe(getMe);
      expect(authApi.logout).toBe(logout);
    });
  });
});
