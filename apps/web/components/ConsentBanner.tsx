import { useEffect, useState } from 'react';
import { Button } from '@notania/ui';

const CONSENT_KEY = 'notania-consent';

type ConsentState = 'unknown' | 'accepted' | 'rejected';

export function ConsentBanner() {
  const [consent, setConsent] = useState<ConsentState>('unknown');

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? (window.localStorage.getItem(CONSENT_KEY) as ConsentState | null) : null;
    if (stored) {
      setConsent(stored);
    }
  }, []);

  useEffect(() => {
    if (consent === 'accepted') {
      loadAdVendors();
    }
  }, [consent]);

  if (consent !== 'unknown') {
    return null;
  }

  return (
    <div className="mb-6 rounded-2xl border border-white/10 bg-slate-900/90 p-6 text-sm text-slate-200 shadow-lg">
      <h2 className="mb-2 text-base font-semibold text-white">We value your privacy</h2>
      <p className="mb-4 text-slate-300">
        Notania uses cookies and local storage to personalize content, provide social media features, and analyze our traffic. You can
        choose to accept or reject optional cookies.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => {
            setConsent('accepted');
            window.localStorage.setItem(CONSENT_KEY, 'accepted');
          }}
        >
          Accept all
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setConsent('rejected');
            window.localStorage.setItem(CONSENT_KEY, 'rejected');
          }}
        >
          Reject optional cookies
        </Button>
      </div>
    </div>
  );
}

function loadAdVendors() {
  if (typeof window === 'undefined') return;

  if (!document.getElementById('gam-script')) {
    const script = document.createElement('script');
    script.src = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js';
    script.async = true;
    script.id = 'gam-script';
    document.body.appendChild(script);
    window.googletag = window.googletag || { cmd: [] };
  }

  if (!document.getElementById('adinplay-script')) {
    const script = document.createElement('script');
    script.src = 'https://api.adinplay.com/libs/aiptag/pub/notania/notania.js';
    script.async = true;
    script.id = 'adinplay-script';
    document.body.appendChild(script);
    window.aiptag = window.aiptag || { cmd: { display: [], player: [] } };
  }
}
