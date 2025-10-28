import { ReactNode } from 'react';

export interface GridProps {
  children: ReactNode;
  columns?: string;
}

export function Grid({ children, columns = 'repeat(auto-fill, minmax(220px, 1fr))' }: GridProps) {
  return <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: columns }}>{children}</div>;
}
