/**
 * Composant Input - ImmoLomé
 * Champ de formulaire réutilisable
 */

import { forwardRef, useState } from 'react';
import clsx from 'clsx';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    icon: Icon,
    type = 'text',
    className = '',
    inputClassName = '',
    required = false,
    disabled = false,
    ...props
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <label className="label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="w-5 h-5 text-gray-400" />
          </div>
        )}
        
        <input
          ref={ref}
          type={inputType}
          disabled={disabled}
          className={clsx(
            'input',
            Icon && 'pl-10',
            isPassword && 'pr-10',
            error && 'input-error',
            disabled && 'bg-gray-100 cursor-not-allowed',
            inputClassName
          )}
          {...props}
        />
        
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <EyeSlashIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <EyeIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        )}
      </div>
      
      {error && <p className="error-message">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  );
});

export default Input;

/**
 * Textarea
 */
export const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    hint,
    className = '',
    required = false,
    rows = 4,
    ...props
  },
  ref
) {
  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <label className="label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        rows={rows}
        className={clsx(
          'input resize-none',
          error && 'input-error'
        )}
        {...props}
      />
      
      {error && <p className="error-message">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  );
});

/**
 * Select
 */
export const Select = forwardRef(function Select(
  {
    label,
    error,
    hint,
    options = [],
    placeholder = 'Sélectionner...',
    className = '',
    required = false,
    ...props
  },
  ref
) {
  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <label className="label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <select
        ref={ref}
        className={clsx(
          'input appearance-none cursor-pointer',
          error && 'input-error'
        )}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && <p className="error-message">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  );
});

/**
 * Checkbox
 */
export const Checkbox = forwardRef(function Checkbox(
  { label, error, className = '', ...props },
  ref
) {
  return (
    <div className={clsx('flex items-start', className)}>
      <input
        ref={ref}
        type="checkbox"
        className="w-4 h-4 mt-0.5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        {...props}
      />
      {label && (
        <label className="ml-2 text-sm text-gray-700">{label}</label>
      )}
      {error && <p className="error-message ml-6">{error}</p>}
    </div>
  );
});
