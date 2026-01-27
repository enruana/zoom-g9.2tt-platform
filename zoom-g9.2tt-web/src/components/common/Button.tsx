import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  accentColor?: string;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
};

const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed';

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  accentColor,
  children,
  className = '',
  disabled,
  style,
  ...props
}: ButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        if (accentColor) {
          return {
            className: 'text-white focus:ring-blue-500',
            style: {
              background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 100%)`,
              boxShadow: `0 4px 14px ${accentColor}40`,
            },
          };
        }
        return {
          className: 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/25 focus:ring-blue-500',
          style: {},
        };
      case 'success':
        return {
          className: 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-lg shadow-green-500/25 focus:ring-green-500',
          style: {},
        };
      case 'danger':
        return {
          className: 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-lg shadow-red-500/25 focus:ring-red-500',
          style: {},
        };
      case 'ghost':
        return {
          className: 'bg-transparent hover:bg-neutral-800 text-neutral-400 hover:text-white focus:ring-neutral-500',
          style: {},
        };
      case 'secondary':
      default:
        return {
          className: 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700/50 hover:border-neutral-600 focus:ring-neutral-500',
          style: {},
        };
    }
  };

  const variantStyles = getVariantStyles();

  const LoadingSpinner = () => (
    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
  );

  return (
    <button
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantStyles.className}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      style={{ ...variantStyles.style, ...style }}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {!loading && icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
      {children && <span>{children}</span>}
      {!loading && icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
    </button>
  );
}

/** Icon button - circular, for toolbar actions */
export function IconButton({
  variant = 'ghost',
  size = 'md',
  children,
  className = '',
  ...props
}: Omit<ButtonProps, 'icon' | 'iconPosition' | 'fullWidth'>) {
  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white',
    secondary: 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white border border-neutral-700/50',
    ghost: 'bg-transparent hover:bg-neutral-800 text-neutral-400 hover:text-white',
    danger: 'bg-red-600 hover:bg-red-500 text-white',
    success: 'bg-green-600 hover:bg-green-500 text-white',
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center rounded-xl transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-neutral-500
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

/** Toggle button - for ON/OFF states like Online Mode */
export function ToggleButton({
  isOn,
  onLabel = 'ON',
  offLabel = 'OFF',
  size = 'md',
  accentColor,
  className = '',
  ...props
}: {
  isOn: boolean;
  onLabel?: string;
  offLabel?: string;
  size?: ButtonSize;
  accentColor?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>) {
  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-3 py-1 text-xs gap-1.5',
    md: 'px-4 py-1.5 text-xs gap-2',
    lg: 'px-5 py-2 text-sm gap-2',
  };

  const activeColor = accentColor || '#22c55e';

  return (
    <button
      className={`
        inline-flex items-center font-semibold rounded-full transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900
        ${sizeClasses[size]}
        ${className}
      `}
      style={{
        background: isOn
          ? `linear-gradient(135deg, ${activeColor} 0%, ${activeColor}dd 100%)`
          : 'linear-gradient(135deg, #404040 0%, #2a2a2a 100%)',
        color: isOn ? '#fff' : '#a3a3a3',
        boxShadow: isOn ? `0 0 12px ${activeColor}66` : 'none',
      }}
      {...props}
    >
      <span
        className={`w-2 h-2 rounded-full ${isOn ? 'bg-white animate-pulse' : 'bg-neutral-600'}`}
      />
      {isOn ? onLabel : offLabel}
    </button>
  );
}
