'use client';
import { useEffect, useRef, useState } from 'react';
import { AdSenseConfig } from '../lib/api';

declare global {
  interface Window {
    adsbygoogle: Record<string, unknown>[];
  }
}

interface AdSenseAdProps {
  config: AdSenseConfig | null;
  placement: 'homepage' | 'post-sidebar' | 'post-content';
  className?: string;
}

export default function AdSenseAd({ config, placement, className = '' }: AdSenseAdProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);
  const [scriptReady, setScriptReady] = useState(false);

  // Wait for the adsbygoogle script to be loaded before pushing
  useEffect(() => {
    if (pushed.current) return;

    // Check immediately
    if (typeof window !== 'undefined' && window.adsbygoogle) {
      setScriptReady(true);
      return;
    }

    // Poll for script readiness (Google script may load asynchronously)
    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        setScriptReady(true);
        clearInterval(interval);
      }
    }, 300);

    // Stop polling after 10 seconds
    const timeout = setTimeout(() => clearInterval(interval), 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Push the ad slot once the script is ready
  useEffect(() => {
    if (!scriptReady || pushed.current) return;
    if (!adRef.current) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch (e) {
      console.error('AdSense push error:', e);
    }
  }, [scriptReady]);

  // Early return if disabled or missing config
  if (!config?.enabled || !config?.publisher_id) {
    return null;
  }

  let adUnitId: string | undefined;
  switch (placement) {
    case 'homepage':
      adUnitId = config.homepage_ad_unit_id;
      break;
    case 'post-sidebar':
      adUnitId = config.post_sidebar_ad_unit_id;
      break;
    case 'post-content':
      adUnitId = config.post_content_ad_unit_id;
      break;
  }

  if (!adUnitId) {
    return null;
  }

  return (
    <aside className={`ad-container ${className}`} aria-label="Advertisement">
      <span className="ad-label">Advertisement</span>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center' }}
        data-ad-client={config.publisher_id}
        data-ad-slot={adUnitId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
