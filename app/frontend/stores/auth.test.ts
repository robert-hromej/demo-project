import { describe, it, expect, beforeEach } from "vitest";
import {
  useAuthStore,
  selectUser,
  selectToken,
  selectIsAuthenticated,
  selectIsLoading,
} from "./auth";
import type { User } from "@/types";

const TOKEN_KEY = "auth_token";

const mockUser: User = {
  id: 1,
  email: "test@example.com",
  name: "Test User",
  avatarUrl: null,
  createdAt: "2025-01-01T00:00:00Z",
};

const anotherUser: User = {
  id: 2,
  email: "another@example.com",
  name: "Another User",
  avatarUrl: "https://example.com/avatar.jpg",
  createdAt: "2025-06-15T12:00:00Z",
};

describe("useAuthStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
    });
  });

  describe("initial state", () => {
    it("has user set to null", () => {
      expect(useAuthStore.getState().user).toBeNull();
    });

    it("has token set to null", () => {
      expect(useAuthStore.getState().token).toBeNull();
    });

    it("has isAuthenticated set to false", () => {
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it("has isLoading set to true", () => {
      expect(useAuthStore.getState().isLoading).toBe(true);
    });
  });

  describe("login", () => {
    it("sets user and token", () => {
      useAuthStore.getState().login({ user: mockUser, token: "jwt-token-123" });

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe("jwt-token-123");
    });

    it("sets isAuthenticated to true", () => {
      useAuthStore.getState().login({ user: mockUser, token: "jwt-token-123" });

      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it("sets isLoading to false", () => {
      useAuthStore.getState().login({ user: mockUser, token: "jwt-token-123" });

      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it("stores token in localStorage", () => {
      useAuthStore.getState().login({ user: mockUser, token: "jwt-token-123" });

      expect(localStorage.getItem(TOKEN_KEY)).toBe("jwt-token-123");
    });
  });

  describe("logout", () => {
    beforeEach(() => {
      useAuthStore.getState().login({ user: mockUser, token: "jwt-token-123" });
    });

    it("clears user", () => {
      useAuthStore.getState().logout();

      expect(useAuthStore.getState().user).toBeNull();
    });

    it("clears token", () => {
      useAuthStore.getState().logout();

      expect(useAuthStore.getState().token).toBeNull();
    });

    it("sets isAuthenticated to false", () => {
      useAuthStore.getState().logout();

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it("sets isLoading to false", () => {
      useAuthStore.getState().logout();

      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it("removes token from localStorage", () => {
      useAuthStore.getState().logout();

      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    });
  });

  describe("setUser", () => {
    it("updates user when given a user object", () => {
      useAuthStore.getState().login({ user: mockUser, token: "jwt-token-123" });
      useAuthStore.getState().setUser(anotherUser);

      expect(useAuthStore.getState().user).toEqual(anotherUser);
    });

    it("preserves other state when updating user", () => {
      useAuthStore.getState().login({ user: mockUser, token: "jwt-token-123" });
      useAuthStore.getState().setUser(anotherUser);

      const state = useAuthStore.getState();
      expect(state.token).toBe("jwt-token-123");
      expect(state.isAuthenticated).toBe(true);
    });

    it("calls logout when given null (clears everything)", () => {
      useAuthStore.getState().login({ user: mockUser, token: "jwt-token-123" });
      useAuthStore.getState().setUser(null);

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    });
  });

  describe("setLoading", () => {
    it("sets isLoading to true", () => {
      useAuthStore.getState().setLoading(false);
      useAuthStore.getState().setLoading(true);

      expect(useAuthStore.getState().isLoading).toBe(true);
    });

    it("sets isLoading to false", () => {
      useAuthStore.getState().setLoading(false);

      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe("initialize", () => {
    it("with token in localStorage: sets token and isAuthenticated=false, isLoading=true", () => {
      localStorage.setItem(TOKEN_KEY, "stored-token");

      useAuthStore.getState().initialize();

      const state = useAuthStore.getState();
      expect(state.token).toBe("stored-token");
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(true);
    });

    it("without token in localStorage: sets isAuthenticated=false, isLoading=false", () => {
      useAuthStore.getState().initialize();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  describe("selectors", () => {
    it("selectUser returns the current user", () => {
      useAuthStore.getState().login({ user: mockUser, token: "jwt-token-123" });

      expect(selectUser(useAuthStore.getState())).toEqual(mockUser);
    });

    it("selectUser returns null when no user", () => {
      expect(selectUser(useAuthStore.getState())).toBeNull();
    });

    it("selectToken returns the current token", () => {
      useAuthStore.getState().login({ user: mockUser, token: "jwt-token-123" });

      expect(selectToken(useAuthStore.getState())).toBe("jwt-token-123");
    });

    it("selectToken returns null when no token", () => {
      expect(selectToken(useAuthStore.getState())).toBeNull();
    });

    it("selectIsAuthenticated returns true when authenticated", () => {
      useAuthStore.getState().login({ user: mockUser, token: "jwt-token-123" });

      expect(selectIsAuthenticated(useAuthStore.getState())).toBe(true);
    });

    it("selectIsAuthenticated returns false when not authenticated", () => {
      expect(selectIsAuthenticated(useAuthStore.getState())).toBe(false);
    });

    it("selectIsLoading returns the current loading state", () => {
      expect(selectIsLoading(useAuthStore.getState())).toBe(true);

      useAuthStore.getState().setLoading(false);
      expect(selectIsLoading(useAuthStore.getState())).toBe(false);
    });
  });
});
