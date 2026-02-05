import { forwardRef, useState, type HTMLAttributes } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Container } from "./Container";
import { Button } from "@/components/ui/Button";
import { Menu, X, ChefHat, Search } from "lucide-react";

export interface NavLink {
  label: string;
  href: string;
  isActive?: boolean;
}

export interface HeaderProps extends HTMLAttributes<HTMLElement> {
  navLinks?: NavLink[];
  isAuthenticated?: boolean;
  onLogin?: () => void;
  onSignup?: () => void;
  onLogout?: () => void;
  userName?: string;
}

const defaultNavLinks: NavLink[] = [
  { label: "Recipes", href: "/recipes" },
  { label: "Categories", href: "/categories" },
  { label: "My Favorites", href: "/favorites" },
];

export const Header = forwardRef<HTMLElement, HeaderProps>(
  (
    {
      className,
      navLinks = defaultNavLinks,
      isAuthenticated = false,
      onLogin,
      onSignup,
      onLogout,
      userName,
      ...props
    },
    ref
  ) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    const isLinkActive = (href: string) => {
      return location.pathname === href || location.pathname.startsWith(`${href}/`);
    };

    return (
      <header
        ref={ref}
        className={cn("sticky top-0 z-40 bg-white border-b border-gray-200", className)}
        {...props}
      >
        <Container>
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 text-orange-500 hover:text-orange-600 transition-colors"
            >
              <ChefHat className="h-8 w-8" />
              <span className="text-xl font-bold text-gray-900">RecipeMatch</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    isLinkActive(link.href)
                      ? "bg-orange-50 text-orange-600"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <button
                type="button"
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Search recipes"
              >
                <Search className="h-5 w-5" />
              </button>

              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  {userName && (
                    <span className="text-sm text-gray-600">
                      Hello, <span className="font-medium">{userName}</span>
                    </span>
                  )}
                  <Button variant="outline" size="sm" onClick={onLogout}>
                    Log out
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={onLogin}>
                    Log in
                  </Button>
                  <Button variant="primary" size="sm" onClick={onSignup}>
                    Sign up
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </Container>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <Container>
              <nav className="py-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      "block px-4 py-2.5 rounded-lg text-base font-medium transition-colors",
                      isLinkActive(link.href)
                        ? "bg-orange-50 text-orange-600"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="py-4 border-t border-gray-200">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    {userName && (
                      <p className="px-4 text-sm text-gray-600">
                        Signed in as <span className="font-medium">{userName}</span>
                      </p>
                    )}
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => {
                        onLogout?.();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Log out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={() => {
                        onSignup?.();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Sign up
                    </Button>
                    <Button
                      variant="ghost"
                      fullWidth
                      onClick={() => {
                        onLogin?.();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Log in
                    </Button>
                  </div>
                )}
              </div>
            </Container>
          </div>
        )}
      </header>
    );
  }
);

Header.displayName = "Header";
