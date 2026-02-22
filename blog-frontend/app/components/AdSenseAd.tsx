import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation'; // Ensure ads reload on navigation
import { AdSenseConfig } from '../lib/api';

// 1. Fix TypeScript window error
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdSenseAdProps {
  config: AdSenseConfig;
  placement: 'homepage' | 'post-sidebar' | 'post-content';
  className?: string;
}

export default function AdSenseAd({ config, placement, className = '' }: AdSenseAdProps) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

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
    <div key={adUnitId} className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          textAlign: 'center',
          minHeight: '250px',
        }}
        data-ad-client={config.publisher_id}
        data-ad-slot={adUnitId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
