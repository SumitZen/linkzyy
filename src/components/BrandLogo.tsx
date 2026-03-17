import React from 'react';

interface BrandIconProps {
  size?: number;
  className?: string;
  color?: string;
}

export const BrandIcon: React.FC<BrandIconProps> = ({ size = 24, className, color = 'currentColor' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M10 6V20C10 23.3137 12.6863 26 16 26H22C25.3137 26 28 23.3137 28 20C28 16.6863 25.3137 14 22 14H10"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

interface BrandLogoProps {
  size?: number;
  className?: string;
  hideText?: boolean;
  textColor?: string;
  iconColor?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  size = 32, 
  className, 
  hideText = false,
  textColor = 'currentColor',
  iconColor = '#b5637a' // Using the rose color as default for icon
}) => {
  return (
    <div className={`brand-logo-wrap ${className}`} style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      gap: size * 0.3,
      textDecoration: 'none'
    }}>
      <BrandIcon size={size} color={iconColor} />
      {!hideText && (
        <span style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: size * 0.7, 
          fontWeight: 800, 
          color: textColor,
          letterSpacing: '-0.02em',
          textTransform: 'uppercase'
        }}>
          Linkzy
        </span>
      )}
    </div>
  );
};
