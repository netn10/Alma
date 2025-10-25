import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  const inputClasses = `w-full px-3 py-2 border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring disabled:bg-muted disabled:text-muted-foreground bg-card text-foreground border-border ${className}`;
  
  const errorClasses = error ? 'border-destructive focus:ring-destructive focus:border-destructive' : 'border-border';
  
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1">
          {label}
        </label>
      )}
      <input
        className={`${inputClasses} ${errorClasses}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
