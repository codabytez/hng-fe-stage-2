import type { Metadata } from "next";
import { League_Spartan } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/providers/convex-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { getToken } from "@/lib/auth-server";

const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Invoice App",
  description: "Manage your invoices with ease",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialToken = await getToken();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${leagueSpartan.variable} font-sans bg-light-bg dark:bg-dark-bg text-ink dark:text-white antialiased min-w-90`}
      >
        <ConvexClientProvider initialToken={initialToken}>
          <ThemeProvider>
            <QueryProvider>{children}</QueryProvider>
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
