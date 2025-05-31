import React from 'react';

interface AccessibleTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Textarea label text */
  label: string;
  /** Additional class names for the textarea */
  className?: string;
  /** Helper text shown below the textarea */
  helperText?: string;
  /** Error message */
  errorMessage?: string;
  /** Whether the textarea is required */
  isRequired?: boolean;
  /** Textarea has full width */
  fullWidth?: boolean;
  /** Character counter */
  showCharCount?: boolean;
  /** Resize options */
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

/**
 * Accessible Textarea Component
 * 
 * A reusable textarea component that ensures proper accessibility attributes
 * are included. Use this instead of raw HTML textareas to ensure consistency
 * and accessibility compliance.
 */
export default function AccessibleTextarea({
  label,
  className = '',
  helperText,
  errorMessage,
  isRequired = false,
  fullWidth = true,
  showCharCount = false,
  resize = 'vertical',
  id,
  disabled,
  maxLength,
  value = '',
  ...props
}: AccessibleTextareaProps) {
  // Generate a unique ID if not provided
  const textareaId = id || `textarea-${label.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substr(2, 9)}`;
  const helperId = `helper-${textareaId}`;
  const errorId = `error-${textareaId}`;
  
  // Base classes for the textarea
  const baseClasses = 'px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';
  
  // State classes
  const stateClasses = errorMessage 
    ? 'border-red-500 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
    : 'border-gray-300 text-gray-900 placeholder-gray-400';
  
  // Disabled classes
  const disabledClasses = disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : '';
  
  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Resize classes
  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize'
  };
  
  // Combine classes
  const combinedClasses = `${baseClasses} ${stateClasses} ${disabledClasses} ${widthClasses} ${resizeClasses[resize]} ${className}`;
  
  // Set proper ARIA attributes
  const ariaAttributes = {
    'aria-required': isRequired ? true : undefined,
    'aria-invalid': errorMessage ? true : undefined,
    'aria-describedby': errorMessage 
      ? errorId 
      : helperText 
        ? helperId 
        : undefined
  };
  
  // Character count
  const characterCount = typeof value === 'string' ? value.length : 0;
  const characterCountElement = showCharCount && maxLength && (
    <div className="text-xs text-gray-500 text-right mt-1">
      {characterCount}/{maxLength}
    </div>
  );
  
  return (
    <div className={`flex flex-col ${fullWidth ? 'w-full' : ''}`}>
      <label 
        htmlFor={textareaId} 
        className={`mb-1 text-sm font-medium ${errorMessage ? 'text-red-700' : 'text-gray-700'}`}
      >
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <textarea
        id={textareaId}
        disabled={disabled}
        className={combinedClasses}
        maxLength={maxLength}
        value={value}
        {...ariaAttributes}
        {...props}
      />
      
      {characterCountElement}
      
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