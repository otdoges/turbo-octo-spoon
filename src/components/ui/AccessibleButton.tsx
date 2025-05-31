import React from 'react';

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button text content */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
  /** Icon to display before the text */
  leftIcon?: React.ReactNode;
  /** Icon to display after the text */
  rightIcon?: React.ReactNode;
  /** ARIA label for buttons without visible text */
  ariaLabel?: string;
  /** ARIA description for more complex buttons */
  ariaDescription?: string;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost' | 'link';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Button is full width */
  fullWidth?: boolean;
  /** Is loading state */
  isLoading?: boolean;
}

/**
 * Accessible Button Component
 * 
 * A reusable button component that ensures proper accessibility attributes
 * are included. Use this instead of raw HTML buttons to ensure consistency
 * and accessibility compliance.
 */
export default function AccessibleButton({
  children,
  className = '',
  leftIcon,
  rightIcon,
  ariaLabel,
  ariaDescription,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled,
  ...props
}: AccessibleButtonProps) {
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400',
    tertiary: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-100 active:bg-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 active:bg-gray-200',
    link: 'bg-transparent text-indigo-600 hover:text-indigo-800 hover:underline p-0 h-auto'
  };
  
  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Disabled and loading classes
  const stateClasses = (disabled || isLoading) ? 'opacity-60 cursor-not-allowed' : '';
  
  // Combine classes
  const combinedClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClasses} ${stateClasses} ${className}`;
  
  // Set proper ARIA attributes
  const ariaAttributes = {
    'aria-label': ariaLabel,
    'aria-disabled': disabled || isLoading ? true : undefined,
    'aria-busy': isLoading ? true : undefined,
    'aria-describedby': ariaDescription ? `desc-${ariaDescription.replace(/\s+/g, '-').toLowerCase()}` : undefined
  };
  
  return (
    <>
      {ariaDescription && (
        <span id={`desc-${ariaDescription.replace(/\s+/g, '-').toLowerCase()}`} className="sr-only">
          {ariaDescription}
        </span>
      )}
      <button
        className={combinedClasses}
        disabled={disabled || isLoading}
        {...ariaAttributes}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {leftIcon && !isLoading && <span className="mr-2">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    </>
  );
} 