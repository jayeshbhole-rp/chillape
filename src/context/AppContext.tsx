"use client";

import { solana, TangledContextProvider } from "@tangled3/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";

const queryClient = new QueryClient();

const AppContextProvider = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <TangledContextProvider
        config={{
          projectName: "Chill Ape",
          chainConfigs: {
            solana: {
              ...solana,
              rpcUrls: {
                default: {
                  http: [
                    process.env.NEXT_PUBLIC_SOLANA_API ??
                      "https://api.mainnet-beta.solana.com",
                  ],
                },
              },
            },
          },
          twaReturnUrl: `${window.location.origin}/` as `${string}://${string}`,
          bitcoinNetwork: "mainnet",
          nearNetwork: "mainnet",
          projectId: "20ee4bdd5d688d3957fae8f0608fa611",
          tonconnectManifestUrl: `${window.location.origin}/tonconnect-manifest.json`,
        }}
      >
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </TangledContextProvider>
    </QueryClientProvider>
  );
};

export default AppContextProvider;
