import React from 'react';

interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Input label text */
  label: string;
  /** Additional class names for the input */
  className?: string;
  /** Helper text shown below the input */
  helperText?: string;
  /** Error message */
  errorMessage?: string;
  /** Whether the input is required */
  isRequired?: boolean;
  /** Icon to display on the left */
  leftIcon?: React.ReactNode;
  /** Icon to display on the right */
  rightIcon?: React.ReactNode;
  /** Input has full width */
  fullWidth?: boolean;
}

/**
 * Accessible Input Component
 * 
 * A reusable input component that ensures proper accessibility attributes
 * are included. Use this instead of raw HTML inputs to ensure consistency
 * and accessibility compliance.
 */
export default function AccessibleInput({
  label,
  className = '',
  helperText,
  errorMessage,
  isRequired = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  id,
  type = 'text',
  disabled,
  ...props
}: AccessibleInputProps) {
  // Generate a unique ID if not provided
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substr(2, 9)}`;
  const helperId = `helper-${inputId}`;
  const errorId = `error-${inputId}`;
  
  // Base classes for the input
  const baseClasses = 'px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';
  
  // State classes
  const stateClasses = errorMessage 
    ? 'border-red-500 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
    : 'border-gray-300 text-gray-900 placeholder-gray-400';
  
  // Disabled classes
  const disabledClasses = disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : '';
  
  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Icon padding
  const leftPadding = leftIcon ? 'pl-10' : '';
  const rightPadding = rightIcon ? 'pr-10' : '';
  
  // Combine classes
  const combinedClasses = `${baseClasses} ${stateClasses} ${disabledClasses} ${leftPadding} ${rightPadding} ${widthClasses} ${className}`;
  
  // Set proper ARIA attributes using correct types
  const ariaAttributes = {
    'aria-required': isRequired ? true : undefined,
    'aria-invalid': errorMessage ? true : undefined,
    'aria-describedby': errorMessage 
      ? errorId 
      : helperText 
        ? helperId 
        : undefined
  };
  
  return (
    <div className={`flex flex-col ${fullWidth ? 'w-full' : ''}`}>
      <label 
        htmlFor={inputId} 
        className={`mb-1 text-sm font-medium ${errorMessage ? 'text-red-700' : 'text-gray-700'}`}
      >
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        
        <input
          id={inputId}
          type={type}
          disabled={disabled}
          className={combinedClasses}
          {...ariaAttributes}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      
      {helperText && !errorMessage && (
        <p id={helperId} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
      
      {errorMessage && (
        <p id={errorId} className="mt-1 text-sm text-red-600">
          {errorMessage}
        </p>
      )}
    </div>
  );
} 