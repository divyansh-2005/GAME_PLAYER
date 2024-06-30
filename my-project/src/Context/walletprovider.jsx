import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { mainnet, polygon, optimism, arbitrum, base } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import React, { useState, useEffect, createContext, useContext } from "react";

const config = getDefaultConfig({
  appName: "Knowledge Ninjas",
  projectId: "071be6c40c4dfc2798e6870132184cd4",
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