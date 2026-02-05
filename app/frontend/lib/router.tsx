import React from "react";
import { createBrowserRouter, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";
import { MainLayout } from "@/components/layouts/MainLayout";

// Lazy load pages for code splitting
const HomePage = React.lazy(() => import("@/pages/home/HomePage"));
const RecipesPage = React.lazy(() => import("@/pages/recipes/RecipesPage"));
const RecipeDetailPage = React.lazy(() => import("@/pages/recipes/RecipeDetailPage"));
const SearchByIngredientsPage = React.lazy(() => import("@/pages/search/SearchByIngredientsPage"));
const SearchByBudgetPage = React.lazy(() => import("@/pages/search/SearchByBudgetPage"));
const LoginPage = React.lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = React.lazy(() => import("@/pages/auth/RegisterPage"));
const RecipeCreatePage = React.lazy(() => import("@/pages/recipes/RecipeCreatePage"));
const RecipeEditPage = React.lazy(() => import("@/pages/recipes/RecipeEditPage"));
const NotFoundPage = React.lazy(() => import("@/pages/NotFoundPage"));

// Loading fallback for lazy-loaded components
function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent mx-auto" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

// Suspense wrapper for lazy-loaded pages
function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <React.Suspense fallback={<PageLoader />}>{children}</React.Suspense>;
}

// Protected route guard - redirects to login if not authenticated
function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    // Redirect to login, preserving the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

// Guest-only route guard - redirects to home if already authenticated
function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader />;
  }

  if (isAuthenticated) {
    // Redirect to the page they came from, or home
    const from = (location.state as { from?: Location })?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
}

// Root layout wrapper
function RootLayout() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}

// Router configuration
export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      // Public routes
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <HomePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "recipes",
        children: [
          {
            index: true,
            element: (
              <SuspenseWrapper>
                <RecipesPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: ":id",
            element: (
              <SuspenseWrapper>
                <RecipeDetailPage />
              </SuspenseWrapper>
            ),
          },
        ],
      },
      {
        path: "search",
        children: [
          {
            path: "ingredients",
            element: (
              <SuspenseWrapper>
                <SearchByIngredientsPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: "budget",
            element: (
              <SuspenseWrapper>
                <SearchByBudgetPage />
              </SuspenseWrapper>
            ),
          },
        ],
      },

      // Guest-only routes (login/register)
      {
        element: <GuestRoute />,
        children: [
          {
            path: "login",
            element: (
              <SuspenseWrapper>
                <LoginPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: "register",
            element: (
              <SuspenseWrapper>
                <RegisterPage />
              </SuspenseWrapper>
            ),
          },
        ],
      },

      // Protected routes (require authentication)
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "recipes/new",
            element: (
              <SuspenseWrapper>
                <RecipeCreatePage />
              </SuspenseWrapper>
            ),
          },
          {
            path: "recipes/:id/edit",
            element: (
              <SuspenseWrapper>
                <RecipeEditPage />
              </SuspenseWrapper>
            ),
          },
        ],
      },

      // 404 Not Found
      {
        path: "*",
        element: (
          <SuspenseWrapper>
            <NotFoundPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },
]);

export default router;
