'use client';
import { useEffect, useRef, useCallback } from 'react';
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

function getSlotId(config: AdSenseConfig, placement: AdSenseAdProps['placement']): string | undefined {
  switch (placement) {
    case 'homepage':
      return config.homepage_ad_unit_id;
    case 'post-sidebar':
      return config.post_sidebar_ad_unit_id;
    case 'post-content':
      return config.post_content_ad_unit_id;
  }
}

export default function AdSenseAd({ config, placement, className = '' }: AdSenseAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);

  const pushAd = useCallback(() => {
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense may throw if slot is already filled or blocked
    }
  }, []);

  useEffect(() => {
    if (pushed.current) return;
    if (!config?.enabled || !config?.publisher_id) return;

    const adUnitId = getSlotId(config, placement);
    if (!adUnitId) return;

    // If the script is already loaded, push immediately
    if (typeof window !== 'undefined' && window.adsbygoogle) {
      pushAd();
      return;
    }

    // Otherwise wait for the script to load by observing the <ins> element
    // Google's script will mutate it when ready
    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        clearInterval(interval);
        pushAd();
      }
    }, 200);

    const timeout = setTimeout(() => clearInterval(interval), 15000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [config, placement, pushAd]);

  // Don't render anything if disabled or missing config
  if (!config?.enabled || !config?.publisher_id) return null;

  const adUnitId = getSlotId(config, placement);
  if (!adUnitId) return null;

  return (
    <div ref={containerRef} className={`ad-slot ${className}`}>
      <span className="ad-label">Advertisement</span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', minHeight: '100px' }}
        data-ad-client={config.publisher_id}
        data-ad-slot={adUnitId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
