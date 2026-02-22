"use client";
import { useState } from 'react';

export default function ShareButtons({ url, title }: { url: string; title?: string }){
  const [copied, setCopied] = useState(false);
  const [tooltips, setTooltips] = useState<{ [key: string]: boolean }>({});

  async function copy(){
    try{
      const frontendUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}${url}` 
        : url;
      await navigator.clipboard.writeText(frontendUrl);
      setCopied(true);
      setTimeout(()=>setCopied(false), 2000);
    }catch{
      // ignore
    }
  }

  const showTooltip = (id: string) => setTooltips(prev => ({ ...prev, [id]: true }));
  const hideTooltip = (id: string) => setTooltips(prev => ({ ...prev, [id]: false }));

  const frontendUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${url}` 
    : url;

  return (
    <div className="flex flex-col gap-2">
      {/* Facebook */}
      <div className="relative group">
        <a 
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(frontendUrl)}`} 
          target="_blank" 
          rel="noreferrer"
          onMouseEnter={() => showTooltip('fb')}
          onMouseLeave={() => hideTooltip('fb')}
          className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200"
          style={{
            background: 'rgba(59, 89, 152, 0.2)',
            border: '1.5px solid rgba(59, 89, 152, 0.4)',
            backdropFilter: 'blur(10px)'
          }}
          title="Share on Facebook"
        >
          <span className="text-lg font-bold">f</span>
        </a>
        {tooltips['fb'] && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap pointer-events-none">
            Facebook
          </div>
        )}
      </div>

      {/* Twitter/X */}
      <div className="relative group">
        <a 
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(frontendUrl)}&text=${encodeURIComponent(title||'')}`} 
          target="_blank" 
          rel="noreferrer"
          onMouseEnter={() => showTooltip('tw')}
          onMouseLeave={() => hideTooltip('tw')}
          className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200"
          style={{
            background: 'rgba(29, 161, 242, 0.2)',
            border: '1.5px solid rgba(29, 161, 242, 0.4)',
            backdropFilter: 'blur(10px)'
          }}
          title="Share on Twitter"
        >
          <span className="text-lg font-bold">𝕏</span>
        </a>
        {tooltips['tw'] && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap pointer-events-none">
            Twitter
          </div>
        )}
      </div>

      {/* Copy Link */}
      <div className="relative group">
        <button 
          onClick={copy}
          onMouseEnter={() => showTooltip('copy')}
          onMouseLeave={() => hideTooltip('copy')}
          className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200"
          style={{
            background: copied ? 'rgba(34, 197, 94, 0.2)' : 'rgba(139, 92, 246, 0.2)',
            border: copied ? '1.5px solid rgba(34, 197, 94, 0.4)' : '1.5px solid rgba(139, 92, 246, 0.4)',
            backdropFilter: 'blur(10px)'
          }}
          title={copied ? 'Copied!' : 'Copy link'}
        >
          <span className="text-lg">{copied ? '✓' : '🔗'}</span>
        </button>
        {tooltips['copy'] && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap pointer-events-none">
            {copied ? 'Copied!' : 'Copy link'}
          </div>
        )}
      </div>
    </div>
  );
}
