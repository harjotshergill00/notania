import { useEffect } from 'react';

export interface AdSlotProps {
  id: string;
  network?: 'gam' | 'adinplay';
  sizes?: string;
  className?: string;
}

declare global {
  interface Window {
    googletag?: any;
    aiptag?: any;
  }
}

export function AdSlot({ id, network = 'gam', sizes = 'responsive', className }: AdSlotProps) {
  useEffect(() => {
    if (network === 'gam' && window.googletag?.cmd) {
      window.googletag.cmd.push(() => {
        try {
          window.googletag.display(id);
        } catch (error) {
          console.warn('Failed to display GAM slot', error);
        }
      });
    }

    if (network === 'adinplay' && window.aiptag?.cmd) {
      window.aiptag.cmd.display.push(() => window.aiptag?.display?.(id));
    }
  }, [id, network]);

  return <div id={id} data-ad-network={network} data-ad-sizes={sizes} className={className} />;
}
