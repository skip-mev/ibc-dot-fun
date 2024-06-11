import "@/styles/globals.css";

import { SwapWidgetProvider } from "@skip-go/widget";
import { Analytics } from "@vercel/analytics/react";
import { AppProps } from "next/app";

import { DefaultSeo } from "@/components/DefaultSeo";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <DefaultSeo />
      <Analytics />
      <SwapWidgetProvider>
        <Component {...pageProps} />
      </SwapWidgetProvider>
    </>
  );
}
