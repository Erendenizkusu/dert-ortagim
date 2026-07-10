import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

const description =
  "Dertlerini paylaş, yalnız olmadığını hisset. Aynı yolu yürümüş insanlardan tavsiye al.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "dertdaş",
    template: "%s · dertdaş",
  },
  description,
  openGraph: {
    type: "website",
    siteName: "dertdaş",
    locale: "tr_TR",
    url: siteUrl,
    title: "dertdaş",
    description,
  },
  twitter: { card: "summary_large_image", title: "dertdaş", description },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" suppressHydrationWarning className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SiteHeader />
          <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-16 pt-6">
            {children}
          </main>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
