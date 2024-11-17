import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'ghost';
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    className = '',
    ...props
}) => {
    const baseStyles = "px-4 py-2 rounded-lg font-medium flex items-center justify-center";
    const variants = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white",
        outline: "border border-gray-300 hover:bg-gray-50 text-gray-700",
        ghost: "hover:bg-gray-100 text-gray-700"
    };

    return (
        <button
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
        >
        {children}
        </button>
    );
};
