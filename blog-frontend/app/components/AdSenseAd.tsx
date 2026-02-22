'use client';

import { useEffect, useRef } from 'react';
import { AdSenseConfig } from '../lib/api';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdSenseAdProps {
  config: AdSenseConfig | null;
  placement: 'homepage' | 'post-sidebar' | 'post-content';
  className?: string;
}

function getSlotId(
  config: AdSenseConfig,
  placement: AdSenseAdProps['placement']
): string | undefined {
  switch (placement) {
    case 'homepage':
      return config.homepage_ad_unit_id;
    case 'post-sidebar':
      return config.post_sidebar_ad_unit_id;
    case 'post-content':
      return config.post_content_ad_unit_id;
  }
}

export default function AdSenseAd({
  config,
  placement,
  className = '',
}: AdSenseAdProps) {
  const insRef = useRef<HTMLModElement | null>(null);
  const pushedRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!config?.enabled || !config?.publisher_id) return;

    const slot = getSlotId(config, placement);
    if (!slot) return;

    const ins = insRef.current;
    if (!ins) return;

    // already filled by AdSense
    if (ins.getAttribute('data-adsbygoogle-status') === 'done') return;

    // prevent duplicate push
    if (pushedRef.current) return;

    function pushAd() {
      if (pushedRef.current) return;
      if (!window.adsbygoogle) return;

      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushedRef.current = true;
      } catch {
        // ignore duplicate fill / blocked
      }
    }

    // Lazy load when visible
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e.isIntersecting) {
          pushAd();
          observerRef.current?.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observerRef.current.observe(ins);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [config, placement]);

  if (!config?.enabled || !config?.publisher_id) return null;

  const slot = getSlotId(config, placement);
  if (!slot) return null;

  return (
    <div
      className={`adsense-container ${className}`}
      style={{
        width: '100%',
        display: 'block',
        overflow: 'hidden',
        textAlign: 'center',
      }}
    >
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{
          display: 'block',
          width: '100%',
          minHeight: '120px',
        }}
        data-ad-client={config.publisher_id}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}