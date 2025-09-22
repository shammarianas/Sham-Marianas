import * as React from "react";
import React from "react";
import { cn } from "../../lib/utils";

const Sheet = ({ open, onOpenChange, children }) => {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div 
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange?.(false)}
      />
      {children}
    </div>
  );
};

const SheetContent = React.forwardRef(({ 
  className, 
  side = "left", 
  children, 
  ...props 
}, ref) => {
  const sideClasses = {
    left: "left-0 top-0 h-full animate-slide-in-from-left",
    right: "right-0 top-0 h-full animate-slide-in-from-right",
    top: "top-0 left-0 w-full animate-slide-in-from-top",
    bottom: "bottom-0 left-0 w-full animate-slide-in-from-bottom",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "fixed z-50 bg-background shadow-lg border-r",
        sideClasses[side],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SheetContent.displayName = "SheetContent";

export { Sheet, SheetContent };
