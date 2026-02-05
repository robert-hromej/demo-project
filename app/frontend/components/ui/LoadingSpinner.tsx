import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "secondary" | "white";
  label?: string;
}

const sizeStyles = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

const colorStyles = {
  primary: "text-orange-500",
  secondary: "text-gray-500",
  white: "text-white",
};

const textSizes = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-lg",
};

export const LoadingSpinner = forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  (
    { className, size = "md", color = "primary", label, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-center justify-center gap-2", className)}
        role="status"
        aria-label={label || "Loading"}
        {...props}
      >
        <Loader2
          className={cn("animate-spin", sizeStyles[size], colorStyles[color])}
          aria-hidden="true"
        />
        {label && (
          <span className={cn("text-gray-600", textSizes[size])}>{label}</span>
        )}
        <span className="sr-only">{label || "Loading..."}</span>
      </div>
    );
  }
);

LoadingSpinner.displayName = "LoadingSpinner";

// Full page loading overlay
export interface PageLoaderProps extends LoadingSpinnerProps {
  overlay?: boolean;
}

export const PageLoader = forwardRef<HTMLDivElement, PageLoaderProps>(
  ({ overlay = true, label = "Loading...", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center",
          overlay
            ? "fixed inset-0 z-50 bg-white/80 backdrop-blur-sm"
            : "min-h-[200px] w-full"
        )}
      >
        <LoadingSpinner size="xl" label={label} {...props} />
      </div>
    );
  }
);

PageLoader.displayName = "PageLoader";

// Inline loading indicator
export interface InlineLoaderProps extends HTMLAttributes<HTMLSpanElement> {
  size?: "sm" | "md";
}

export const InlineLoader = forwardRef<HTMLSpanElement, InlineLoaderProps>(
  ({ className, size = "sm", ...props }, ref) => {
    const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";

    return (
      <span
        ref={ref}
        className={cn("inline-flex items-center gap-1", className)}
        {...props}
      >
        <Loader2 className={cn("animate-spin text-gray-400", iconSize)} />
      </span>
    );
  }
);

InlineLoader.displayName = "InlineLoader";
