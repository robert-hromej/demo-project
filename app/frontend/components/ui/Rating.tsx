import React, { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Star, StarHalf } from "lucide-react";

export interface RatingProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  maxValue?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  reviewCount?: number;
}

const sizeStyles = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

const textSizes = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

export const Rating = forwardRef<HTMLDivElement, RatingProps>(
  (
    { className, value, maxValue = 5, size = "md", showValue = false, reviewCount, ...props },
    ref
  ) => {
    const clampedValue = Math.min(Math.max(0, value), maxValue);
    const fullStars = Math.floor(clampedValue);
    const hasHalfStar = clampedValue % 1 >= 0.5;
    const emptyStars = maxValue - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-1", className)}
        aria-label={`Rating: ${clampedValue} out of ${maxValue} stars`}
        {...props}
      >
        <div className="flex items-center">
          {/* Full stars */}
          {Array.from({ length: fullStars }).map((_, index) => (
            <Star
              key={`full-${index}`}
              className={cn(sizeStyles[size], "fill-yellow-400 text-yellow-400")}
              aria-hidden="true"
            />
          ))}

          {/* Half star */}
          {hasHalfStar && (
            <div className="relative">
              <Star className={cn(sizeStyles[size], "text-gray-300")} aria-hidden="true" />
              <StarHalf
                className={cn(sizeStyles[size], "absolute inset-0 fill-yellow-400 text-yellow-400")}
                aria-hidden="true"
              />
            </div>
          )}

          {/* Empty stars */}
          {Array.from({ length: emptyStars }).map((_, index) => (
            <Star
              key={`empty-${index}`}
              className={cn(sizeStyles[size], "text-gray-300")}
              aria-hidden="true"
            />
          ))}
        </div>

        {(showValue || reviewCount !== undefined) && (
          <span className={cn("text-gray-600", textSizes[size])}>
            {showValue && <span className="font-medium">{clampedValue.toFixed(1)}</span>}
            {reviewCount !== undefined && (
              <span className="text-gray-400">
                {showValue && " "}({reviewCount})
              </span>
            )}
          </span>
        )}
      </div>
    );
  }
);

Rating.displayName = "Rating";

// Interactive rating component for user input
export interface InteractiveRatingProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  value: number;
  onChange: (value: number) => void;
  maxValue?: number;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

export const InteractiveRating = forwardRef<HTMLDivElement, InteractiveRatingProps>(
  ({ className, value, onChange, maxValue = 5, size = "md", disabled = false, ...props }, ref) => {
    const [hoverValue, setHoverValue] = React.useState<number | null>(null);

    const displayValue = hoverValue ?? value;

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-0.5",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onMouseLeave={() => !disabled && setHoverValue(null)}
        {...props}
      >
        {Array.from({ length: maxValue }).map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= displayValue;

          return (
            <button
              key={index}
              type="button"
              className={cn("transition-colors", !disabled && "cursor-pointer hover:scale-110")}
              onClick={() => !disabled && onChange(starValue)}
              onMouseEnter={() => !disabled && setHoverValue(starValue)}
              disabled={disabled}
              aria-label={`Rate ${starValue} out of ${maxValue} stars`}
            >
              <Star
                className={cn(
                  sizeStyles[size],
                  isFilled
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300 hover:text-yellow-300"
                )}
              />
            </button>
          );
        })}
      </div>
    );
  }
);

InteractiveRating.displayName = "InteractiveRating";
