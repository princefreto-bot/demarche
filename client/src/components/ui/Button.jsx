/**
 * Composant Button - ImmoLomé
 * Bouton réutilisable avec variantes
 */

import { forwardRef } from 'react';
import clsx from 'clsx';
import Loader from './Loader';

const variants = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
  secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500',
  accent: 'bg-accent-500 text-white hover:bg-accent-600 focus:ring-accent-400',
  outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
  ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-300',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
};

const sizes = {
  xs: 'px-2.5 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
};

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    loading = false,
    icon: Icon = null,
    iconPosition = 'left',
    fullWidth = false,
    type = 'button',
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={clsx(
        'inline-flex items-center justify-center font-medium rounded-lg',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <Loader 
            size="sm" 
            color={variant === 'outline' || variant === 'ghost' ? 'primary' : 'white'} 
            className="mr-2" 
          />
          <span>Chargement...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <Icon className={clsx('w-5 h-5', children && 'mr-2')} />
          )}
          {children}
          {Icon && iconPosition === 'right' && (
            <Icon className={clsx('w-5 h-5', children && 'ml-2')} />
          )}
        </>
      )}
    </button>
  );
});

export default Button;

/**
 * Bouton icône seule
 */
export function IconButton({
  icon: Icon,
  variant = 'ghost',
  size = 'md',
  className = '',
  label,
  ...props
}) {
  const iconSizes = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7',
  };

  const buttonSizes = {
    xs: 'p-1',
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
    xl: 'p-3',
  };

  return (
    <button
      type="button"
      aria-label={label}
      className={clsx(
        'inline-flex items-center justify-center rounded-lg',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    >
      <Icon className={iconSizes[size]} />
    </button>
  );
}
