import * as React from "react";
import { cn } from "../../lib/utils";

const TooltipProvider = ({ delayDuration = 700, children }) => {
  return <div>{children}</div>;
};

const Tooltip = ({ children }) => {
  const [open, setOpen] = React.useState(false);
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {React.Children.map(children, (child, index) => {
        if (index === 0) {
          return React.cloneElement(child, {
            'data-tooltip-trigger': true
          });
        }
        return React.cloneElement(child, {
          open,
          'data-tooltip-content': true
        });
      })}
    </div>
  );
};

const TooltipTrigger = React.forwardRef(({ asChild, children, ...props }, ref) => {
  if (asChild) {
    return React.cloneElement(children, { ref, ...props });
  }
  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
});
TooltipTrigger.displayName = "TooltipTrigger";

const TooltipContent = React.forwardRef(({ 
  className, 
  side = "top", 
  align = "center",
  hidden = false,
  children, 
  ...props 
}, ref) => {
  if (hidden) return null;

  const sideClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2"
  };

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-md shadow-md whitespace-nowrap",
        sideClasses[side],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
TooltipContent.displayName = "TooltipContent";

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
};
