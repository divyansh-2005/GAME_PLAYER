import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { mainnet, polygon, optimism, arbitrum, base } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import React, { useState, useEffect, createContext, useContext } from "react";

const config = getDefaultConfig({
  appName: "My RainbowKit App",
  projectId: "384f4d284ce7c0be6ef44925f84f6b49",
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: true,
});

const walletContext = createContext();
const queryClient = new QueryClient();

export const WalletProvider = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

// Custom hook to use the TmaContext
export const useWallet = () => useContext(walletContext);