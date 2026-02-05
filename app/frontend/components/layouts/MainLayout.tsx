import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";
import { useLogout } from "@/hooks/mutations/useAuth";
import { Button } from "@/components/ui/Button";
import { ChefHat, Search, DollarSign, Menu, X, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const logoutMutation = useLogout({
    onSuccess: () => navigate("/"),
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navigation = [
    { name: "Recipes", href: "/recipes", icon: ChefHat },
    { name: "Search by Ingredients", href: "/search/ingredients", icon: Search },
    { name: "Search by Budget", href: "/search/budget", icon: DollarSign },
  ];

  const isActiveLink = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <nav className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-orange-600">
              <ChefHat className="h-8 w-8" />
              <span className="hidden sm:inline">RecipeMatch</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:gap-6">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-1.5 text-sm font-medium transition-colors",
                      isActiveLink(item.href)
                        ? "text-orange-600"
                        : "text-gray-600 hover:text-orange-600"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Auth Buttons (Desktop) */}
            <div className="hidden md:flex md:items-center md:gap-3">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-600">
                    <User className="inline-block h-4 w-4 mr-1" />
                    {user?.name || user?.email}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    isLoading={logoutMutation.isPending}
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col gap-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActiveLink(item.href)
                          ? "bg-orange-50 text-orange-600"
                          : "text-gray-600 hover:bg-gray-50 hover:text-orange-600"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}

                <div className="mt-4 pt-4 border-t border-gray-200">
                  {isAuthenticated ? (
                    <>
                      <div className="px-3 py-2 text-sm text-gray-600">
                        <User className="inline-block h-4 w-4 mr-1" />
                        {user?.name || user?.email}
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                      >
                        <LogOut className="h-5 w-5" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Link
                        to="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="px-3 py-2 rounded-lg text-sm font-medium text-center bg-orange-500 text-white hover:bg-orange-600"
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <ChefHat className="h-6 w-6 text-orange-500" />
              <span className="font-semibold">RecipeMatch</span>
            </div>
            <p className="text-sm text-gray-500">
              Find recipes based on your ingredients and budget
            </p>
            <nav className="flex gap-4 text-sm text-gray-500">
              <Link to="/recipes" className="hover:text-orange-600">
                Recipes
              </Link>
              <Link to="/search/ingredients" className="hover:text-orange-600">
                By Ingredients
              </Link>
              <Link to="/search/budget" className="hover:text-orange-600">
                By Budget
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;
