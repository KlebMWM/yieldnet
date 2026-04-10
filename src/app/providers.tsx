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
  projectId: "04cbbf5b5e04e1281de3c0e97d498a77",
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
  transports: {
    [mainnet.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [polygon.id]: http(),
    [base.id]: http(),
    [bsc.id]: http(),
    [avalanche.id]: http(),
    [gnosis.id]: http(),
    [zkSync.id]: http(),
    [linea.id]: http(),
    [scroll.id]: http(),
    [fantom.id]: http(),
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
