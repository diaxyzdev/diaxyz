import React from 'react';

/**
 * A reusable, accessible Button component.
 * 
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'outline'} [props.variant='primary'] - The visual style variant of the button.
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - The size of the button.
 * @param {React.ReactNode} props.children - The content to display inside the button.
 * @param {boolean} [props.disabled=false] - Whether the button is disabled.
 * @param {React.CSSProperties} [props.style] - Inline styles for custom overrides.
 * @param {string} [props.className=''] - Additional CSS classes.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  disabled = false,
  style = {},
  className = '',
  ...props
}) {
  // Default styling using inline styles to ensure it works out of the box
  // without requiring pre-configured CSS frameworks (like Tailwind).
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontWeight: '500',
    borderRadius: '4px',
    border: '1px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background-color 0.2s, border-color 0.2s, box-shadow 0.2s',
    outline: 'none',
    opacity: disabled ? 0.6 : 1,
    textDecoration: 'none',
  };

  const sizeStyles = {
    sm: {
      padding: '4px 8px',
      fontSize: '12px',
    },
    md: {
      padding: '8px 16px',
      fontSize: '14px',
    },
    lg: {
      padding: '12px 24px',
      fontSize: '16px',
    },
  };

  const variantStyles = {
    primary: {
      backgroundColor: '#0066cc',
      color: '#ffffff',
    },
    secondary: {
      backgroundColor: '#6c757d',
      color: '#ffffff',
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: '#6c757d',
      color: '#6c757d',
    },
  };

  const combinedStyles = {
    ...baseStyle,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  };

  return (
    <button
      style={combinedStyles}
      disabled={disabled}
      className={`btn-${variant} btn-${size} ${className}`.trim()}
      onClick={() => console.log('button clicked!')}
      {...props}
    >
      {children}
    </button>
  );
}
