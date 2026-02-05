import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, htmlFor, error, hint, required = false, className, children }, ref) => {
    const fieldId = htmlFor || `field-${Math.random().toString(36).slice(2, 9)}`;
    const hasError = Boolean(error);

    return (
      <div ref={ref} className={cn("flex flex-col gap-1.5", className)}>
        {label && (
          <label htmlFor={fieldId} className="text-sm font-medium text-gray-700">
            {label}
            {required && (
              <span className="ml-1 text-red-500" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        {children}

        {error && (
          <p id={`${fieldId}-error`} className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {hint && !hasError && (
          <p id={`${fieldId}-hint`} className="text-sm text-gray-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";

// Controller wrapper for react-hook-form integration
export interface ControlledFormFieldProps extends Omit<FormFieldProps, "children" | "error"> {
  render: (props: { id: string; hasError: boolean }) => ReactNode;
  error?: { message?: string };
}

export const ControlledFormField = forwardRef<HTMLDivElement, ControlledFormFieldProps>(
  ({ render, error, htmlFor, ...props }, ref) => {
    const fieldId = htmlFor || `field-${Math.random().toString(36).slice(2, 9)}`;
    const hasError = Boolean(error?.message);

    return (
      <FormField ref={ref} htmlFor={fieldId} error={error?.message} {...props}>
        {render({ id: fieldId, hasError })}
      </FormField>
    );
  }
);

ControlledFormField.displayName = "ControlledFormField";
