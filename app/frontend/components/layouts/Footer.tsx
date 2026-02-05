import { forwardRef, type HTMLAttributes } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Container } from "./Container";
import { ChefHat, Github, Twitter, Instagram } from "lucide-react";

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface FooterProps extends HTMLAttributes<HTMLElement> {
  sections?: FooterSection[];
  showSocials?: boolean;
}

const defaultSections: FooterSection[] = [
  {
    title: "Explore",
    links: [
      { label: "All Recipes", href: "/recipes" },
      { label: "Categories", href: "/categories" },
      { label: "Popular", href: "/recipes?sort=popular" },
      { label: "Recent", href: "/recipes?sort=recent" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "My Favorites", href: "/favorites" },
      { label: "My Recipes", href: "/my-recipes" },
      { label: "Settings", href: "/settings" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

export const Footer = forwardRef<HTMLElement, FooterProps>(
  ({ className, sections = defaultSections, showSocials = true, ...props }, ref) => {
    const currentYear = new Date().getFullYear();

    return (
      <footer ref={ref} className={cn("bg-gray-50 border-t border-gray-200", className)} {...props}>
        <Container>
          <div className="py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {/* Brand Column */}
              <div className="col-span-2 md:col-span-1">
                <Link
                  to="/"
                  className="flex items-center gap-2 text-orange-500 hover:text-orange-600 transition-colors"
                >
                  <ChefHat className="h-8 w-8" />
                  <span className="text-xl font-bold text-gray-900">RecipeMatch</span>
                </Link>
                <p className="mt-4 text-sm text-gray-600">
                  Discover and share delicious recipes from around the world.
                </p>

                {showSocials && (
                  <div className="mt-6 flex items-center gap-3">
                    <a
                      href="https://twitter.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                      aria-label="Twitter"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                      aria-label="Instagram"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                      aria-label="GitHub"
                    >
                      <Github className="h-5 w-5" />
                    </a>
                  </div>
                )}
              </div>

              {/* Link Sections */}
              {sections.map((section) => (
                <div key={section.title}>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    {section.title}
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        {link.external ? (
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                          >
                            {link.label}
                          </a>
                        ) : (
                          <Link
                            to={link.href}
                            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                          >
                            {link.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-200 py-6">
            <p className="text-sm text-gray-500 text-center">
              {currentYear} RecipeMatch. All rights reserved.
            </p>
          </div>
        </Container>
      </footer>
    );
  }
);

Footer.displayName = "Footer";
