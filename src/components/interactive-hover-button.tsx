import React from "react";
import "./interactive-hover-button.css";

export interface InteractiveHoverButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const InteractiveHoverButton = React.forwardRef<HTMLButtonElement, InteractiveHoverButtonProps>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`interactive-hover-button ${className}`}
        {...props}
      >
        <div className="button-content">
          <div className="button-dot"></div>
          <span className="button-text">{children}</span>
        </div>
        
        <div className="button-text-hover">
          <span>{children}</span>
          <svg className="button-arrow" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 11v2h12l-5.5 5.5 1.42 1.42L19.84 12l-7.92-7.92L10.5 5.5 16 11H4z"/>
          </svg>
        </div>
      </button>
    );
  }
);

InteractiveHoverButton.displayName = "InteractiveHoverButton";
