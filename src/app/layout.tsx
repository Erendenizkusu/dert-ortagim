import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: {
    default: "dert ortağım",
    template: "%s · dert ortağım",
  },
  description:
    "Dertlerini paylaş, yalnız olmadığını hisset. Aynı yolu yürümüş insanlardan tavsiye al.",
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
          <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-24 pt-6">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
