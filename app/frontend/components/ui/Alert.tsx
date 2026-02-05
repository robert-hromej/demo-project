import React, { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

export type AlertVariant = "success" | "error" | "warning" | "info";

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: AlertVariant;
  title?: ReactNode;
  icon?: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const variantStyles: Record<AlertVariant, string> = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};

const iconColorStyles: Record<AlertVariant, string> = {
  success: "text-green-500",
  error: "text-red-500",
  warning: "text-yellow-500",
  info: "text-blue-500",
};

const defaultIcons: Record<AlertVariant, ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5" />,
  error: <AlertCircle className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
  info: <Info className="h-5 w-5" />,
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = "info",
      title,
      icon,
      dismissible = false,
      onDismiss,
      children,
      ...props
    },
    ref
  ) => {
    const displayIcon = icon ?? defaultIcons[variant];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn("flex gap-3 rounded-lg border p-4", variantStyles[variant], className)}
        {...props}
      >
        {displayIcon && (
          <div className={cn("shrink-0", iconColorStyles[variant])}>{displayIcon}</div>
        )}
        <div className="flex-1 min-w-0">
          {title && <h5 className="font-medium mb-1">{title}</h5>}
          {children && <div className={cn("text-sm", title ? "opacity-90" : "")}>{children}</div>}
        </div>
        {dismissible && (
          <button
            type="button"
            onClick={onDismiss}
            className={cn(
              "shrink-0 rounded-lg p-1 transition-colors",
              "hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2",
              variant === "success" && "focus:ring-green-500",
              variant === "error" && "focus:ring-red-500",
              variant === "warning" && "focus:ring-yellow-500",
              variant === "info" && "focus:ring-blue-500"
            )}
            aria-label="Dismiss alert"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = "Alert";

// Toast-style alert for temporary notifications
export interface ToastAlertProps extends AlertProps {
  show?: boolean;
  duration?: number;
  onHide?: () => void;
}

export const ToastAlert = forwardRef<HTMLDivElement, ToastAlertProps>(
  ({ show = true, duration = 5000, onHide, dismissible = true, onDismiss, ...props }, ref) => {
    React.useEffect(() => {
      if (show && duration > 0 && onHide) {
        const timer = setTimeout(onHide, duration);
        return () => clearTimeout(timer);
      }
    }, [show, duration, onHide]);

    if (!show) {
      return null;
    }

    return (
      <Alert
        ref={ref}
        dismissible={dismissible}
        onDismiss={onDismiss || onHide}
        className="shadow-lg"
        {...props}
      />
    );
  }
);

ToastAlert.displayName = "ToastAlert";
