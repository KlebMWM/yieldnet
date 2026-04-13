"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, http } from "wagmi";
import {
  mainnet,
  optimism,
  arbitrum,
  polygon,
  base,
  bsc,
  avalanche,
  gnosis,
  zkSync,
  linea,
  scroll,
  fantom,
} from "wagmi/chains";
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import type { Locale as RKLocale } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { useState } from "react";
import { ThemeProvider, useTheme } from "@/lib/ThemeContext";
import { I18nProvider, useI18n } from "@/lib/i18n";

const config = getDefaultConfig({
  appName: "YieldNet",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "04cbbf5b5e04e1281de3c0e97d498a77",
  chains: [
    mainnet,
    optimism,
    arbitrum,
    polygon,
    base,
    bsc,
    avalanche,
    gnosis,
    zkSync,
    linea,
    scroll,
    fantom,
  ],
  // Explicit CORS-friendly public RPCs so wagmi doesn't fall back to
  // eth.merkle.io, which blocks browser origins and spams the console.
  transports: {
    [mainnet.id]: http("https://ethereum-rpc.publicnode.com"),
    [optimism.id]: http("https://optimism-rpc.publicnode.com"),
    [arbitrum.id]: http("https://arbitrum-one-rpc.publicnode.com"),
    [polygon.id]: http("https://polygon-bor-rpc.publicnode.com"),
    [base.id]: http("https://base-rpc.publicnode.com"),
    [bsc.id]: http("https://bsc-rpc.publicnode.com"),
    [avalanche.id]: http("https://avalanche-c-chain-rpc.publicnode.com"),
    [gnosis.id]: http("https://gnosis-rpc.publicnode.com"),
    [zkSync.id]: http("https://zksync-era-rpc.publicnode.com"),
    [linea.id]: http("https://linea-rpc.publicnode.com"),
    [scroll.id]: http("https://scroll-rpc.publicnode.com"),
    [fantom.id]: http("https://fantom-rpc.publicnode.com"),
  },
  ssr: true,
});

const rkDark = darkTheme({
  accentColor: "#a78bfa",
  accentColorForeground: "white",
  borderRadius: "large",
});

const rkLight = lightTheme({
  accentColor: "#7c3aed",
  accentColorForeground: "white",
  borderRadius: "large",
});

const RK_LOCALE_MAP: Record<string, RKLocale> = {
  en: "en" as RKLocale,
  "zh-TW": "zh-TW" as RKLocale,
  "zh-CN": "zh-CN" as RKLocale,
};

function RainbowKitWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const { locale } = useI18n();
  return (
    <RainbowKitProvider
      theme={theme === "dark" ? rkDark : rkLight}
      locale={RK_LOCALE_MAP[locale] ?? ("en" as RKLocale)}
    >
      {children}
    </RainbowKitProvider>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider>
      <I18nProvider>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitWrapper>{children}</RainbowKitWrapper>
          </QueryClientProvider>
        </WagmiProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
