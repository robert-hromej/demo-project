import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types";

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (params: { user: User; token: string }) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  initialize: () => void;
}

const TOKEN_KEY = "auth_token";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      // Login action - sets user and token
      login: ({ user, token }) => {
        // Store token in localStorage (for API client)
        localStorage.setItem(TOKEN_KEY, token);

        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      // Logout action - clears user and token
      logout: () => {
        // Remove token from localStorage
        localStorage.removeItem(TOKEN_KEY);

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      // Update user data (after profile update, etc.)
      setUser: (user) => {
        if (user) {
          set({ user });
        } else {
          // If setting user to null, also clear auth state
          get().logout();
        }
      },

      // Set loading state
      setLoading: (isLoading) => {
        set({ isLoading });
      },

      // Initialize auth state from localStorage
      initialize: () => {
        const token = localStorage.getItem(TOKEN_KEY);

        if (token) {
          // Token exists - mark as potentially authenticated
          // The actual user data should be fetched via API
          set({
            token,
            isAuthenticated: false, // Will be set to true after user fetch
            isLoading: true,
          });
        } else {
          // No token - definitely not authenticated
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist user data, not loading state
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      // Rehydrate callback
      onRehydrateStorage: () => (state) => {
        if (state) {
          // After rehydration, verify token is still in localStorage
          const token = localStorage.getItem(TOKEN_KEY);
          if (!token) {
            state.logout();
          } else {
            state.setLoading(false);
          }
        }
      },
    }
  )
);

// Selectors for common use cases
export const selectUser = (state: AuthState) => state.user;
export const selectToken = (state: AuthState) => state.token;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;

// Re-export types for convenience
export type { User };
