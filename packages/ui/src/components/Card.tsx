import { ReactNode } from 'react';
import clsx from 'clsx';

export interface CardProps {
  children: ReactNode;
  as?: 'div' | 'article' | 'section';
  className?: string;
  href?: string;
}

export function Card({ children, className, as: Tag = 'div', href }: CardProps) {
  const Component: any = href ? 'a' : Tag;
  return (
    <Component
      className={clsx(
        'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900',
        className,
      )}
      href={href}
    >
      {children}
    </Component>
  );
}
