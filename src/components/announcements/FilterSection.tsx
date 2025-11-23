import type { ReactNode } from 'react';

interface FilterSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

/**
 * Generic section wrapper for filter components.
 */
export function FilterSection({ title, children, className }: FilterSectionProps) {
  return (
    <div className={className}>
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

