'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

interface AdSenseConfig {
  enabled: boolean;
  publisher_id?: string;
  homepage_ad_unit_id?: string;
  post_sidebar_ad_unit_id?: string;
  post_content_ad_unit_id?: string;
}

interface AdSenseAdProps {
  placement: 'homepage' | 'post-sidebar' | 'post-content';
  className?: string;
}

let scriptLoaded = false;

export default function AdSenseAd({ placement, className = '' }: AdSenseAdProps) {
  const [config, setConfig] = useState<AdSenseConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdConfig = async () => {
      try {
        const response = await fetch('/api/adsense-settings/');
        if (response.ok) {
          const data: AdSenseConfig = await response.json();
          setConfig(data);
        }
      } catch (error) {
        console.error('Failed to fetch AdSense config:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdConfig();
  }, []);

  if (loading || !config?.enabled || !config?.publisher_id) {
    return null;
  }

  let adUnitId: string | undefined;
  let adSlotId: string | undefined;

  switch (placement) {
    case 'homepage':
      adUnitId = config.homepage_ad_unit_id;
      adSlotId = 'ad-slot-homepage';
      break;
    case 'post-sidebar':
      adUnitId = config.post_sidebar_ad_unit_id;
      adSlotId = 'ad-slot-post-sidebar';
      break;
    case 'post-content':
      adUnitId = config.post_content_ad_unit_id;
      adSlotId = 'ad-slot-post-content';
      break;
  }

  if (!adUnitId) {
    return null;
  }

  return (
    <>
      {/* Load Google AdSense script once */}
      {!scriptLoaded && (
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-xxxxxxxxxxxxxxxx"
          onLoad={() => {
            scriptLoaded = true;
          }}
          strategy="afterInteractive"
        />
      )}

      {/* Ad container */}
      <div className={`ad-container ${className}`}>
        <ins
          className="adsbygoogle"
          style={{
            display: 'block',
            textAlign: 'center',
            minHeight: '250px',
          }}
          data-ad-client={`ca-pub-${config.publisher_id?.split('-').pop() || 'xxxxxxxxxxxxxxxx'}`}
          data-ad-slot={adUnitId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
        <Script id={`ad-script-${adSlotId}`} strategy="afterInteractive">
          {`(adsbygoogle = window.adsbygoogle || []).push({});`}
        </Script>
      </div>
    </>
  );
}
