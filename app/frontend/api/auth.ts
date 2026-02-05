import { apiClient, setToken, removeToken } from "./client";
import type {
  AuthResponse,
  User,
  RegisterRequest,
  LoginRequest,
} from "../types";

/**
 * Register a new user
 */
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/auth/register", data);

  // Automatically store the token on successful registration
  if (response.token) {
    setToken(response.token);
  }

  return response;
}

/**
 * Login with email and password
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/auth/login", data);

  // Automatically store the token on successful login
  if (response.token) {
    setToken(response.token);
  }

  return response;
}

/**
 * Get the current authenticated user
 */
export async function getMe(): Promise<User> {
  return apiClient.get<User>("/auth/me");
}

/**
 * Logout the current user (client-side only)
 */
export function logout(): void {
  removeToken();
}

export const authApi = {
  register,
  login,
  getMe,
  logout,
};
