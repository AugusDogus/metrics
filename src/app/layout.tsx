import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { Navbar } from "~/components/navbar";
import { ThemeProvider } from "~/components/theme-provider";
import { TRPCReactProvider } from "~/trpc/react";
import { api, HydrateClient } from "~/trpc/server";

export const metadata: Metadata = {
  title: "Lighthouse Metrics",
  description:
    "Monitor your website's performance metrics from Google Lighthouse",
  icons: [{ rel: "icon", url: "/favicon.svg" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Prefetch sheets data for the navbar
  await api.metrics.getAllSheets.prefetch();

  return (
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCReactProvider>
            <NuqsAdapter>
              <HydrateClient>
                <div className="bg-background min-h-screen">
                  <Navbar />
                  <main className="container mx-auto px-4 py-8">
                    {children}
                  </main>
                </div>
              </HydrateClient>
            </NuqsAdapter>
          </TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
