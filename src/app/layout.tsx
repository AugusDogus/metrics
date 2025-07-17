import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";

import { Navbar } from "~/components/navbar";
import { ThemeProvider } from "~/components/theme-provider";
import { TRPCReactProvider } from "~/trpc/react";
import { api, HydrateClient } from "~/trpc/server";

export const metadata: Metadata = {
  title: "Lighthouse Metrics Dashboard",
  description:
    "Monitor your website's performance metrics from Google Lighthouse",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

async function NavbarWithData() {
  try {
    const sheets = await api.metrics.getAllSheets();
    return <Navbar sheets={sheets} />;
  } catch (error) {
    console.error("Failed to load sheets for navbar:", error);
    return <Navbar sheets={[]} />;
  }
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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
                  <Suspense fallback={<div className="h-14 border-b" />}>
                    <NavbarWithData />
                  </Suspense>
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
