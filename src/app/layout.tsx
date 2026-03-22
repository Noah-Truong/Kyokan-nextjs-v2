import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    default: "ラクユーZ工法協会 | 不断水水替工法",
    template: "%s | ラクユーZ工法協会",
  },
  description:
    "RAKUYU-Z工法は、供用中の下水道関連工事において、周辺環境の衛生面や安全面、本工事の施工性と品質確保に応える不断水水替工法です。",
  keywords: [
    "RAKUYU-Z工法",
    "ラクユーZ",
    "不断水水替工法",
    "下水工事",
    "水替工法",
    "京都",
    "下水道工事",
    "管更生",
    "災害復旧",
  ],
  authors: [{ name: "ラクユーZ工法協会" }],
  creator: "ラクユーZ工法協会",
  publisher: "ラクユーZ工法協会",
  formatDetection: {
    telephone: true,
    date: false,
    email: true,
    address: true,
  },
  metadataBase: new URL("https://rakuyuz.jp"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ラクユーZ工法協会",
    description:
      "RAKUYU-Z工法は不断水水替工法。下水道関連工事の施工性と品質確保に応えます。",
    url: "https://rakuyuz.jp",
    siteName: "ラクユーZ工法協会",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ラクユーZ工法協会",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ラクユーZ工法協会",
    description:
      "RAKUYU-Z工法は不断水水替工法。下水道関連工事の施工性と品質確保に応えます。",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#0f1729",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="scroll-smooth">
      <head>
        {/* Preconnect to Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        
        {/* Preconnect to Google APIs for model-viewer */}
        <link rel="preconnect" href="https://ajax.googleapis.com" />
        
        {/* Preload model-viewer script */}
        <link
          rel="modulepreload"
          href="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js"
        />

        {/* Favicon */}
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "ラクユーZ工法協会",
              alternateName: "RAKUYU-Z Construction Method Association",
              url: "https://rakuyuz.jp",
              logo: "https://rakuyuz.jp/logo.png",
              description:
                "RAKUYU-Z工法（不断水水替工法）の普及と技術向上を目的とした協会。",
              address: {
                "@type": "PostalAddress",
                streetAddress: "西京極北大入町66",
                addressLocality: "京都市右京区",
                addressRegion: "京都府",
                postalCode: "615-0881",
                addressCountry: "JP",
              },
              telephone: "+81-75-323-1445",
              sameAs: [],
              award: "第4回インフラメンテナンス大賞 防衛大臣賞・優秀賞",
            }),
          }}
        />
      </head>
      <body className="antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
