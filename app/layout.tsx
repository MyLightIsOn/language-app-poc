import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";

const urbanist = Urbanist({ subsets: ["latin"], variable: "--font-primary" });

export const metadata: Metadata = {
  title: "Language Learning App Proof of Concept",
  description:
    "Language learning app proof of concept that uses ChatGPT Assistant",
  icons: {
    icon: "/panda.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${urbanist.variable} antialiased`}>
        {process.env.OPENAI_ASSISTANT_ID && children}
      </body>
    </html>
  );
}
