import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionWrapper from "./components/SessionWrapper";
import Navbar from "./components/Navbar";
import { getAdSenseSettings } from "./lib/api";
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
  title: "Zuuu Blog - Glassmorphic stories for AWDS discovery",
  description:
    "A modern glassmorphic blog platform built for fast AWDS visibility, rich search snippets, and engaging story discovery.",
  keywords: [
    'blog',
    'AWDS',
    'SEO',
    'glassmorphism',
    'stories',
    'tech',
    'lifestyle',
    'Uzbekistan',
    'next.js',
  ],
  metadataBase: new URL('https://zuuu.uz'),
  openGraph: {
    title: "Zuuu Blog - Glassmorphic stories for AWDS discovery",
    description:
      "Explore the Zuuu Blog for modern articles, optimized categories, and rich sharing designed for AWDS search performance.",
    type: 'website',
    url: 'https://zuuu.uz',
    siteName: 'Zuuu Blog',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Zuuu Blog - Glassmorphic stories for AWDS discovery",
    description:
      "Explore the Zuuu Blog for modern articles, optimized categories, and rich sharing designed for AWDS search performance.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsense = await getAdSenseSettings();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* ✅ Standard HTML script avoids the AdSense "data-nscript" error */}
        {adsense?.enabled && adsense?.publisher_id && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsense.publisher_id}`}
            crossOrigin="anonymous"
          ></script>
        )}

        {/* ✅ Standard HTML script in head prevents body hydration mismatches */}
        <script
          id="theme-init"
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
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <SessionWrapper>
          <Navbar />
          {children}
        </SessionWrapper>

        <Analytics />
      </body>
    </html>
  );
}