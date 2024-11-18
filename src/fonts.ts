import { Inter } from "next/font/google";
import localFont from "next/font/local";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  fallback: ["sans-serif"],
  weight: "variable",
});

const dystopian = localFont({
  src: [
    {
      path: "../public/fonts/Dystopian-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/Dystopian-Regular.woff2",
      style: "normal",
    },
    {
      path: "../public/fonts/Dystopian-Bold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/Dystopian-Black.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-dystopian",
});

export { dystopian, inter };
