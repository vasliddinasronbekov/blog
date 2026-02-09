"use client";
import { useState } from 'react';

export default function ShareButtons({ url, title }: { url: string; title?: string }){
  const [copied, setCopied] = useState(false);

  async function copy(){
    try{
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(()=>setCopied(false), 2000);
    }catch(e){
      // ignore
    }
  }

  return (
    <div className="flex items-center gap-2">
      <a className="text-sm muted hover:text-accent" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer">Facebook</a>
      <a className="text-sm muted hover:text-accent" href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title||'')}`} target="_blank" rel="noreferrer">Twitter</a>
      <button onClick={copy} className="text-sm muted hover:text-accent">{copied ? 'Copied' : 'Copy link'}</button>
    </div>
  );
}
