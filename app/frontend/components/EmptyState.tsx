import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { SearchX, FolderOpen, FileQuestion, Inbox } from "lucide-react";

export type EmptyStateVariant = "search" | "empty" | "notFound" | "default";

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  variant?: EmptyStateVariant;
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

const variantIcons: Record<EmptyStateVariant, ReactNode> = {
  search: <SearchX className="h-12 w-12" />,
  empty: <Inbox className="h-12 w-12" />,
  notFound: <FileQuestion className="h-12 w-12" />,
  default: <FolderOpen className="h-12 w-12" />,
};

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      variant = "default",
      icon,
      title,
      description,
      action,
      secondaryAction,
      children,
      ...props
    },
    ref
  ) => {
    const displayIcon = icon ?? variantIcons[variant];

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center py-12 px-4 text-center",
          className
        )}
        {...props}
      >
        {displayIcon && (
          <div className="text-gray-400 mb-4">{displayIcon}</div>
        )}

        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

        {description && (
          <p className="text-gray-600 max-w-sm mb-6">{description}</p>
        )}

        {children}

        {(action || secondaryAction) && (
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
            {action && (
              <Button variant="primary" onClick={action.onClick}>
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button variant="outline" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }
);

EmptyState.displayName = "EmptyState";

// Convenience components for common empty states
export interface SearchEmptyStateProps extends Omit<EmptyStateProps, "variant" | "title"> {
  searchTerm?: string;
  onClearSearch?: () => void;
}

export const SearchEmptyState = forwardRef<HTMLDivElement, SearchEmptyStateProps>(
  ({ searchTerm, onClearSearch, ...props }, ref) => {
    return (
      <EmptyState
        ref={ref}
        variant="search"
        title="No results found"
        description={
          searchTerm
            ? `We couldn't find any results for "${searchTerm}". Try adjusting your search or filters.`
            : "Try adjusting your search or filters to find what you're looking for."
        }
        action={
          onClearSearch
            ? { label: "Clear search", onClick: onClearSearch }
            : undefined
        }
        {...props}
      />
    );
  }
);

SearchEmptyState.displayName = "SearchEmptyState";

export interface RecipeEmptyStateProps extends Omit<EmptyStateProps, "variant" | "title"> {
  onBrowseRecipes?: () => void;
}

export const RecipeEmptyState = forwardRef<HTMLDivElement, RecipeEmptyStateProps>(
  ({ onBrowseRecipes, ...props }, ref) => {
    return (
      <EmptyState
        ref={ref}
        variant="empty"
        title="No recipes yet"
        description="You haven't saved any recipes yet. Browse our collection to find something delicious!"
        action={
          onBrowseRecipes
            ? { label: "Browse recipes", onClick: onBrowseRecipes }
            : undefined
        }
        {...props}
      />
    );
  }
);

RecipeEmptyState.displayName = "RecipeEmptyState";

export interface FavoritesEmptyStateProps extends Omit<EmptyStateProps, "variant" | "title"> {
  onBrowseRecipes?: () => void;
}

export const FavoritesEmptyState = forwardRef<HTMLDivElement, FavoritesEmptyStateProps>(
  ({ onBrowseRecipes, ...props }, ref) => {
    return (
      <EmptyState
        ref={ref}
        variant="empty"
        title="No favorites yet"
        description="Start adding recipes to your favorites to quickly access them later."
        action={
          onBrowseRecipes
            ? { label: "Discover recipes", onClick: onBrowseRecipes }
            : undefined
        }
        {...props}
      />
    );
  }
);

FavoritesEmptyState.displayName = "FavoritesEmptyState";
