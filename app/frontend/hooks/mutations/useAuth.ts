import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import type { AuthResponse, LoginRequest, RegisterRequest, User } from "@/types";

interface UseAuthOptions {
  onSuccess?: (data: AuthResponse) => void;
  onError?: (error: Error) => void;
}

// Register mutation
export function useRegister(options?: UseAuthOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: RegisterRequest): Promise<AuthResponse> => {
      // Convert camelCase to snake_case for API
      const body = {
        email: credentials.email,
        password: credentials.password,
        password_confirmation: credentials.passwordConfirmation,
        name: credentials.name,
      };

      return apiClient.post<AuthResponse>("/auth/register", { user: body });
    },
    onSuccess: (data) => {
      // Update user cache
      queryClient.setQueryData(["auth", "user"], data.user);

      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

// Login mutation
export function useLogin(options?: UseAuthOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginRequest): Promise<AuthResponse> => {
      return apiClient.post<AuthResponse>("/auth/login", {
        user: credentials,
      });
    },
    onSuccess: (data) => {
      // Update user cache
      queryClient.setQueryData(["auth", "user"], data.user);

      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

// Logout mutation
export function useLogout(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      try {
        await apiClient.delete("/auth/logout");
      } catch {
        // Ignore errors on logout - we'll clear local state anyway
      }
    },
    onSuccess: () => {
      // Clear user cache
      queryClient.setQueryData(["auth", "user"], null);

      // Invalidate all queries that depend on auth
      queryClient.invalidateQueries();

      options?.onSuccess?.();
    },
  });
}

// Get current user (useful for checking auth status on app load)
export function useCurrentUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<User | null> => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        return null;
      }

      try {
        const response = await apiClient.get<{ user: User } | User>("/auth/me");
        return "user" in response ? response.user : response;
      } catch {
        // Token invalid - clear it
        localStorage.removeItem("auth_token");
        return null;
      }
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["auth", "user"], user);
    },
  });
}

// Re-export types for convenience
export type { AuthResponse, LoginRequest, RegisterRequest };
