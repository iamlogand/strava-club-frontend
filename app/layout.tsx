import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ThemeRegistry from "@/app/ThemeRegistry"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AutoRek Strava Club",
  description: "AutoRek Strava Club",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-900`}>
        <ThemeRegistry options={{ key: "mui" }}>{children}</ThemeRegistry>
      </body>
    </html>
  )
}
