import React, { forwardRef } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    placeholder?: string;
    error?: boolean;
    errorMessage?: string;
    label?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ children, placeholder, error, errorMessage, label, className = '', ...props }, ref) => {
        const id = props.id || props.name;

        return (
            <div>
            {label && (
                <label
                htmlFor={id}
                className="block text-sm font-medium text-gray-700 mb-1"
                >
                {label}
                </label>
            )}
            <select
            ref={ref}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                error ? 'border-red-500' : 'border-gray-300'
            } ${className}`}
            aria-invalid={error}
            aria-describedby={error ? `error-${id}` : undefined}
            {...props}
            >
            {placeholder && <option value="">{placeholder}</option>}
            {children}
            </select>
            {error && errorMessage && (
                <p
                className="mt-1 text-xs text-red-500"
                id={`error-${id}`}
                role="alert"
                >
                {errorMessage}
                </p>
            )}
            </div>
        );
    }
);

Select.displayName = 'Select';
