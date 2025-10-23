import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export function Switch({ checked, onChange, disabled = false, label }: SwitchProps) {
  return (
    <div className="flex items-center">
      <button
        type="button"
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:scale-105 active:scale-95 ${
          checked ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'
        } ${disabled ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''}`}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-all duration-200 ease-in-out ${
            checked ? 'translate-x-5 scale-110' : 'translate-x-0'
          }`}
        />
      </button>
      {label && (
        <label className="ml-3 text-sm text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
    </div>
  );
}
