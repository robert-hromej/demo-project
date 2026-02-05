import { useEffect, useState, type ReactNode } from "react";
import { useAuthStore } from "@/stores/auth";
import { apiClient, getToken, removeToken } from "@/api/client";
import type { User } from "@/types";

interface AuthInitializerProps {
  children: ReactNode;
}

export function AuthInitializer({ children }: AuthInitializerProps) {
  const [isReady, setIsReady] = useState(false);
  const { login, setLoading } = useAuthStore();

  useEffect(() => {
    async function initAuth() {
      const token = getToken();

      if (!token) {
        setLoading(false);
        setIsReady(true);
        return;
      }

      try {
        const response = await apiClient.get<{ user: User } | User>("/auth/me");
        const user = "user" in response ? response.user : response;
        login({ user, token });
      } catch {
        removeToken();
        setLoading(false);
      }

      setIsReady(true);
    }

    initAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
