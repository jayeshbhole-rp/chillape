import { CHAIN_ID, ChainId } from "@tangled3/react";
import { z } from "zod";
import arbitrumTokens from "./networks/arbitrum.json";
import avalancheTokens from "./networks/avalanche.json";
import baseTokens from "./networks/base.json";
import binanceTokens from "./networks/binance.json";
import blastTokens from "./networks/blast.json";
import ethereumTokens from "./networks/ethereum.json";
import lineaTokens from "./networks/linea.json";
import mantaTokens from "./networks/manta.json";
import mantleTokens from "./networks/mantle.json";
import optimismTokens from "./networks/optimism.json";
import polygonTokens from "./networks/polygon.json";
import polygonZkevmTokens from "./networks/polygon_zkevm.json";
import scrollTokens from "./networks/scroll.json";
import zksyncTokens from "./networks/zksync.json";

const ChainsSchema = z.enum(Object.keys(CHAIN_ID) as [string, ...string[]]);

export interface TokenBalanceData {
  chainId: ChainId;
  tokenAddress: string;
}

const TokenSchema = z.object({
  symbol: z.string(),
  address: z.string(),
  decimals: z.number(),
  chainId: z.string(),
});

export type Token = z.infer<typeof TokenSchema>;

const TokenMapSchema = z
  .record(z.string(), z.record(z.string(), TokenSchema))
  .refine(
    (obj): obj is Required<typeof obj> =>
      ChainsSchema.options.every((key) => obj[key] != null),
    (v) => ({
      message: `TokenMapSchema: missing chainId ${JSON.stringify(v)}`,
    }),
  )
  .refine(
    (obj) => {
      const chainIds = Object.keys(obj) as ChainId[];
      return chainIds.every((chainId) => {
        const tokens = obj[chainId];
        return Object.keys(tokens).every((tokenAddress) => {
          return tokens[tokenAddress].address === tokenAddress;
        });
      });
    },
    (v) => ({
      message: `TokenMapSchema: token address and key mismatch ${JSON.stringify(v)}`,
    }),
  );

export type TokenMap = z.infer<typeof TokenMapSchema>;

export const TOKEN_MAP: TokenMap = {
  [CHAIN_ID.ethereum]: ethereumTokens,
  [CHAIN_ID.polygon]: polygonTokens,
  [CHAIN_ID.arbitrum]: arbitrumTokens,
  [CHAIN_ID.optimism]: optimismTokens,
  [CHAIN_ID.zksync]: zksyncTokens,
  [CHAIN_ID.avalanche]: avalancheTokens,
  [CHAIN_ID.binance]: binanceTokens,
  [CHAIN_ID.polygon_zkevm]: polygonZkevmTokens,
  [CHAIN_ID.manta]: mantaTokens,
  [CHAIN_ID.scroll]: scrollTokens,
  [CHAIN_ID.mantle]: mantleTokens,
  [CHAIN_ID.base]: baseTokens,
  [CHAIN_ID.linea]: lineaTokens,
  [CHAIN_ID.blast]: blastTokens,
};

export const TOKEN_SYMBOL_MAP = Object.entries(TOKEN_MAP).reduce(
  (symbolMapAcc, [chainId, chainTokens]) => {
    symbolMapAcc[chainId] = Object.values(chainTokens).reduce(
      (chainAcc, token) => {
        chainAcc[token.symbol] = token;
        return chainAcc;
      },
      {} as Record<string, Token>,
    );
    return symbolMapAcc;
  },
  {} as Record<string, Record<string, Token>>,
);
