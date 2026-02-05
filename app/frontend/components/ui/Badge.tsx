import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info";

export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  rounded?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700",
  primary: "bg-orange-100 text-orange-700",
  secondary: "bg-gray-100 text-gray-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  error: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-base",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      rounded = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center font-medium",
          rounded ? "rounded-full" : "rounded-md",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

// Convenience components for common recipe-related badges
export interface DifficultyBadgeProps extends Omit<BadgeProps, "variant"> {
  difficulty: "easy" | "medium" | "hard";
}

const difficultyVariants: Record<DifficultyBadgeProps["difficulty"], BadgeVariant> = {
  easy: "success",
  medium: "warning",
  hard: "error",
};

const difficultyLabels: Record<DifficultyBadgeProps["difficulty"], string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export const DifficultyBadge = forwardRef<HTMLSpanElement, DifficultyBadgeProps>(
  ({ difficulty, children, ...props }, ref) => {
    return (
      <Badge ref={ref} variant={difficultyVariants[difficulty]} rounded {...props}>
        {children || difficultyLabels[difficulty]}
      </Badge>
    );
  }
);

DifficultyBadge.displayName = "DifficultyBadge";

export interface CategoryBadgeProps extends Omit<BadgeProps, "variant"> {
  category: string;
}

export const CategoryBadge = forwardRef<HTMLSpanElement, CategoryBadgeProps>(
  ({ category, ...props }, ref) => {
    return (
      <Badge ref={ref} variant="primary" rounded {...props}>
        {category}
      </Badge>
    );
  }
);

CategoryBadge.displayName = "CategoryBadge";
