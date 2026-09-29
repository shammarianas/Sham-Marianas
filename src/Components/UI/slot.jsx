import * as React from "react";

// Simple implementation of Slot functionality
const Slot = React.forwardRef(({ children, ...props }, ref) => {
  if (React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ...children.props,
      ref: ref,
    });
  }
  return null;
});
Slot.displayName = "Slot";

export { Slot };
