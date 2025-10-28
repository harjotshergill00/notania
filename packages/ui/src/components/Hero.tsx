import { ReactNode } from 'react';
import { Button } from './Button';

export interface HeroProps {
  title: string;
  description: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
  action?: ReactNode;
}

export function Hero({ title, description, ctaLabel = 'Play now', onCtaClick, action }: HeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-8 py-16 text-white shadow-2xl">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
        <p className="max-w-2xl text-lg text-indigo-100">{description}</p>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="secondary" onClick={onCtaClick}>
            {ctaLabel}
          </Button>
          {action}
        </div>
      </div>
    </section>
  );
}
