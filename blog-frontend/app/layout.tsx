import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionWrapper from "./components/SessionWrapper";
import Navbar from "./components/Navbar";
import { getAdSenseSettings } from "./lib/api";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f9fa" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0e15" },
  ],
};

export const metadata: Metadata = {
  title: "Blog - Share Your Stories",
  description:
    "A modern glassmorphic blog platform with spatial design aesthetics inspired by iOS 18+ and visionOS",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsense = await getAdSenseSettings();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* ✅ AdSense global script (singleton safe) */}
        {adsense?.enabled && adsense?.publisher_id && (
          <Script
            id="adsense-script"
            async
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsense.publisher_id}`}
          />
        )}

        {/* ✅ Theme boot script */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
(function(){
 try{
  var stored=localStorage.getItem('theme');
  var mq=window.matchMedia('(prefers-color-scheme: dark)');
  function apply(m){
   var eff=m==='system'?(mq.matches?'dark':'light'):m;
   document.documentElement.setAttribute('data-theme',eff);
  }
  apply(stored||'system');
  mq.addEventListener('change',function(){
   if((localStorage.getItem('theme')||'system')==='system') apply('system');
  });
 }catch(e){}
})();`,
          }}
        />

        <SessionWrapper>
          <Navbar />
          {children}
        </SessionWrapper>

        <Analytics />
      </body>
    </html>
  );
}