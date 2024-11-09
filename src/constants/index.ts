import { type Chain } from "@tangled3/react";

export const TRUST_WALLET_EXCEPTIONS: Partial<Record<Chain, string>> = {
  polygon_zkevm: "polygonzkevm",
  avalanche: "avalanchec",
  binance: "smartchain",
};

// export const INTENTS_BASE_URI = 'https://api.routerintents.com';
export const INTENTS_BASE_URI = "https://api.pod.routerintents.com";
export const INTENTS_BASE_URI_TESTNET = "https://api.routerintents.com";
export const TAGZZ_RNS_URI = "https://api.tagzz.xyz";
