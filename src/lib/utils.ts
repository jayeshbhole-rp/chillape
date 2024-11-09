import { INTENTS_BASE_URI, TRUST_WALLET_EXCEPTIONS } from "@/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getAddress } from "viem";
import { NitroTransactionReceipt } from "../types/nitro";
import { TransactionDetails } from "@/types/intents";
import { Chain, CHAIN_DATA, ChainId } from "@tangled3/react";

/**
 * This is a workaround for the issue with BigInt serialization in JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
(BigInt.prototype as any).toJSON = function () {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return this.toString();
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const capitalized = (word: string) =>
  word.charAt(0).toUpperCase() + word.slice(1);

export const isTokenETH = (address: string) =>
  address &&
  address.toLowerCase() === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
export const areTokensEqual = (tokenA: string, tokenB: string) =>
  tokenA.toLowerCase() === tokenB.toLowerCase();

export const shortenAddress = (address: string | undefined, chars = 4) =>
  address ? `${address.slice(0, chars + 2)}...${address.slice(-chars)}` : "";

export const NATIVE = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

export const fetchNitroGql = async (
  environment: string,
  query: string,
  variables: unknown,
) => {
  let url = "";
  if (environment === "mainnet") {
    url = "https://api.explorer.routernitro.com/graphql";
  } else {
    url = "https://api.iswap-explorer-testnet.routerprotocol.com/graphql";
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json = (await response.json()) as { data: any };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return json.data;
};

export const getExplorerLink = (hash: string, chainId: ChainId) => {
  const explorerUrl = CHAIN_DATA[chainId]?.blockExplorers?.default.url;
  return `${explorerUrl}/tx/${hash}`;
};

export const getExplorerTokenLink = (
  tokenAddress: string,
  chainId: ChainId,
) => {
  const explorerUrl = CHAIN_DATA[chainId]?.blockExplorers?.default.url;
  return `${explorerUrl}/token/${tokenAddress}`;
};

export const NITRO_ENV = process.env.NEXT_PUBLIC_NITRO_ENV;

export const getNitroExplorerLink = (hash?: string) => {
  if (NITRO_ENV === "mainnet") {
    const base = "https://explorer.routernitro.com/";

    if (!hash) return base;
    return `${base}/tx/${hash}`;
  }

  const base = "https://explorer-testnet.routernitro.com/";

  if (!hash) return base;
  return `${base}/tx/${hash}`;
};

export const getTokenLogoURI = (address: string, chain: Chain) => {
  if (!address) return "";
  if (isTokenETH(address))
    if (TRUST_WALLET_EXCEPTIONS[chain])
      return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${TRUST_WALLET_EXCEPTIONS[chain]}/info/logo.png`;
    else
      return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chain}/info/logo.png`;

  const logoUri =
    "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains";

  if (TRUST_WALLET_EXCEPTIONS[chain]) {
    return `${logoUri}/${TRUST_WALLET_EXCEPTIONS[chain]}/assets/${getAddress(address)}/logo.png`;
  }

  return `${logoUri}/${chain}/assets/${getAddress(address)}/logo.png`;
};

export const getTransactionFromNitroExplorer = async (
  hash: string,
  environment: "mainnet" | "testnet",
): Promise<{
  findNitroTransactionByFilter: NitroTransactionReceipt;
  error: unknown;
}> => {
  const testnetTxQuery = `query($hash:String!) {
  transaction(hash: $hash){
    dest_timestamp
    src_timestamp
    src_tx_hash
    dest_tx_hash
    status
    dest_address
    dest_amount
    dest_symbol
    fee_amount
    fee_address
    fee_symbol
    recipient_address
    deposit_id
    src_amount
    dest_amount
    src_stable_address
}}`;
  const mainnetTxQuery = `query($hash:String!) {
  findNitroTransactionByFilter(hash: $hash) {
    dest_timestamp
    src_timestamp
    src_tx_hash
    dest_tx_hash
    status
    dest_address
    dest_amount
    dest_symbol
    fee_amount
    fee_address
    fee_symbol
    recipient_address
    deposit_id
    src_amount
    dest_amount
    src_stable_address
  }
}`;
  const txnQuery = environment === "mainnet" ? mainnetTxQuery : testnetTxQuery;
  const txn = await fetchNitroGql(environment, txnQuery, { hash });
  return txn;
};

export const updateDbTransaction = async ({
  id,
  hash,
  gasFee,
  status,
  refCode,
}: {
  id: string;
  hash: string;
  gasFee: string;
  status: "FAILED" | "COMPLETED" | "PENDING";
  refCode?: string;
  // updateType: 'bulk' | 'adapter';
}) => {
  const res = await fetch(
    INTENTS_BASE_URI + "/router-intent/transaction/update",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        TransactionId: id,
        TransactionStatus: status,
        GasFeeUsed: gasFee.toString(),
        TransactionHash: hash,
        AdapterStatus: [],
        ReferenceCode: refCode,
      }),
    },
  );

  return res;
};

export const getDbTransaction = async ({
  id,
  hash,
  account,
}: {
  id?: string;
  hash?: string;
  account?: string;
}): Promise<TransactionDetails> => {
  if (id) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const res = await fetch(
      INTENTS_BASE_URI + "/router-intent/transaction/get-by-trnx",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          TrnxId: id,
        }),
      },
    ).then((res) => res.json() as unknown as { PayLoad: TransactionDetails });

    return res.PayLoad;
  }

  if (hash) {
    const res = await fetch(
      INTENTS_BASE_URI + "/router-intent/transaction/get-by-hash",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Hash: hash,
        }),
      },
    ).then((res) => res.json() as unknown as { PayLoad: TransactionDetails });

    return res.PayLoad;
  }

  if (account) {
    const res = await fetch(
      INTENTS_BASE_URI + "/router-intent/transaction/get-by-address",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          UserAddress: account,
        }),
      },
    ).then((res) => res.json() as unknown as { PayLoad: TransactionDetails });

    return res.PayLoad;
  }

  throw new Error("Invalid params");
};
