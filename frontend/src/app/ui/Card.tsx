import React from 'react';
import { cn } from './cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Adds hover lift + border brightening. Use for cards that are themselves controls. */
  interactive?: boolean;
  elevation?: 1 | 2 | 3;
}

/**
 * A carved surface: hairline border, ambient shadow and an inner top highlight.
 * The highlight is what stops surfaces reading as flat outlined rectangles.
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, interactive, elevation = 1, children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        'bg-surface border border-line rounded-xl',
        elevation === 1 && 'elev-1',
        elevation === 2 && 'elev-2',
        elevation === 3 && 'elev-3',
        interactive &&
          'cursor-pointer transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-line-hover hover:elev-3',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
