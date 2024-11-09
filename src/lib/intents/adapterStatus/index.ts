import { AdapterMapItem, AdapterStatus } from "@/types";
import { AdapterIdParamsResponse } from "@/types/intents";
import { TransactionReceipt } from "viem";
import { getNitroBridgeStatus } from "./nitro";

export const getAdapterStatusesFromLogs = async ({
  transaction,
  adapters,
}: {
  transaction: TransactionReceipt;
  adapters: AdapterMapItem[];
}) => {
  const adapterStatuses: Record<string, AdapterStatus> = {};

  for (const adapter of adapters) {
    console.log("adapter", adapter.adapterId);
    const status = await getAdapterStatusFromLogs({
      transaction,
      adapter,
    }).catch((e) => {
      console.error("Error getting adapter status", e);
      return "error" as AdapterStatus;
    });
    adapterStatuses[adapter.adapterIndex] = status;
  }

  return adapterStatuses;
};

export const getAdapterStatusFromLogs = async ({
  transaction,
  adapter,
}: {
  transaction: TransactionReceipt;
  adapter: AdapterIdParamsResponse;
}): Promise<AdapterStatus> => {
  switch (adapter.adapterId) {
    case "nitro_bridge":
      return getNitroBridgeStatus({ transaction, adapter });
    case "nitro_bridge_external":
      return getNitroBridgeStatus({ transaction, adapter });
  }

  return "successful";
};
