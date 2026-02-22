
// /media/gradientvvv/Linux/blog-app/blog-frontend/app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionWrapper from "./components/SessionWrapper";
import Navbar from './components/Navbar';
import { getAdSenseSettings } from "./lib/api";
import AdSenseAd from "./components/AdSenseAd";
import Script from "next/script";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blog - Share Your Stories",
  description: "A modern glassmorphic blog platform with spatial design aesthetics inspired by iOS 18+ and visionOS",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f9fa" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0e15" }
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseSettings = await getAdSenseSettings();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {adsenseSettings?.enabled && adsenseSettings?.publisher_id && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseSettings.publisher_id}`}
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body
      
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try{
              var stored = localStorage.getItem('theme');
              var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');

              function apply(mode){
                if(mode === 'system'){
                  var effective = (prefersDark && prefersDark.matches) ? 'dark' : 'light';
                  document.documentElement.setAttribute('data-theme', effective);
                } else {
                  document.documentElement.setAttribute('data-theme', mode);
                }
              }

              // initial
              var mode = stored || 'system';
              apply(mode);

              // listen for system changes only when stored === 'system'
              if(prefersDark){
                if(typeof prefersDark.addEventListener === 'function'){
                  prefersDark.addEventListener('change', function(e){
                    var current = localStorage.getItem('theme') || 'system';
                    if(current === 'system'){
                      apply('system');
                    }
                  });
                } else if(typeof prefersDark.addListener === 'function'){
                  // older browsers
                  prefersDark.addListener(function(e){
                    var current = localStorage.getItem('theme') || 'system';
                    if(current === 'system'){
                      apply('system');
                    }
                  });
                }
              }
            }catch(e){}
          })();
        ` }} />
        <SessionWrapper>
          <Navbar />
          {children}
          {adsenseSettings && <AdSenseAd config={adsenseSettings} placement="homepage" />}
        </SessionWrapper>
      </body>
    </html>
  );
}
