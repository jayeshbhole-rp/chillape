import { ChainIds } from "@/constants/chains";
import { CHAINS_DATA } from "@/constants/chains/list";
import {
  AdapterMap,
  BatchParams,
  BatchQueryCallback,
  BatchStatusData,
} from "@/types";
import { waitForNitro } from "./batchStatus/nitro";
import { isAdapterBridge } from "./utils";

export const queryBatch = async ({
  batchId,
  batches: adapters,
  adapterMap,
  txHash,
  callback,
}: {
  batchId: string;
  batches: string[];
  adapterMap: AdapterMap;
  txHash: string;
  callback: BatchQueryCallback;
}) => {
  const batchPromises: Promise<unknown>[] = [];

  const tabs = "\t".repeat(batchId.split("-").length);
  console.debug(tabs, "[BATCH] QUERY", batchId);

  for (const adapterId of adapters) {
    if (
      adapterMap[adapterId]?.adapterType &&
      !isAdapterBridge(adapterMap[adapterId]?.adapterType)
    )
      continue;

    const batchAdapter = adapterMap[adapterId];

    if (!batchAdapter) {
      return;
    }

    callback(adapterId, "loading", {}, {});

    const statusPromise = awaitBatchCompletion({
      sourceChainId: batchAdapter.sourceChainId,
      destChainId: batchAdapter.destChainId,
      sourceTxHash: txHash,
      batchAdapter,
    })
      .then(async ({ status, batchData, adapterStatuses }) => {
        console.debug(
          tabs + "\t",
          "[BATCH] STATUS",
          adapterId,
          adapterMap[adapterId]!.adapterId,
          status,
        );
        callback(adapterId, status, batchData, adapterStatuses);

        if (
          adapterId &&
          batchData.destTxHash &&
          status !== "error" &&
          status !== "dest_failed" &&
          status !== "src_failed"
        ) {
          await queryBatch({
            batchId: adapterId,
            batches: adapterMap[adapterId]!.adapterIndices,
            adapterMap,
            txHash: batchData.destTxHash,
            callback,
          });
        }
      })
      .catch((e) => {
        console.error("Error fetching batch status", e);
        callback(adapterId, "error", {}, {});
      });

    batchPromises.push(statusPromise);
  }

  return Promise.all(batchPromises).then((data) => {
    console.debug(tabs, "[BATCH] COMPLETE", batchId);

    return data;
  });
};

export const awaitBatchCompletion = async (
  batchParams: BatchParams,
): Promise<BatchStatusData> => {
  const { batchAdapter } = batchParams;

  console.debug(
    "\t".repeat(batchAdapter.adapterIndex.split("-").length),
    "[BATCH] AWAIT",
    batchParams.batchAdapter.adapterIndex,
    batchParams.batchAdapter.adapterId,
  );

  // promise for nitro
  if (
    batchAdapter.adapterId === "nitro_bridge" ||
    batchAdapter.adapterId === "nitro_bridge_external"
  ) {
    const { sourceChainId, destChainId, sourceTxHash } = batchParams;

    let environment: "mainnet" | "testnet" = "mainnet";
    if (CHAINS_DATA[sourceChainId as ChainIds].testnet) {
      environment = "testnet";
    }

    return waitForNitro({ ...batchParams, environment });
  }

  throw new Error(
    `Unsupported bridge or batch adapter ${batchAdapter.adapterIndex} ${batchAdapter.adapterId}`,
  );
};
