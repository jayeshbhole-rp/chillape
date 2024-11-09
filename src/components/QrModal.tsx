"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { useMediaQuery } from "usehooks-ts";
import { Drawer as DrawerPrimitive } from "vaul";
import { formatUnits } from "viem";
import { Button } from "./ui/button";
import { shortenAddress } from "../lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { formatNumber } from "../lib/formatNumber";
import CancelConfirmationModal from "./CancelConfirmationModal";
import useLayoutStore from "../hooks/useLayoutStore";
import { convertToBaseE } from "../lib/utils/convertToBaseE";
import CopyButton from "./ui/CopyButton";

const NavigationButtons = () => {
  const openConfirmationModal = useLayoutStore(
    (state) => state.openConfirmationModal,
  );

  return (
    <>
      <Button
        className="flex-1 opacity-75 hover:opacity-100"
        variant="destructive"
        onClick={openConfirmationModal}
      >
        Cancel request
      </Button>
    </>
  );
};

const QrModal = () => {
  const isDesktop = useMediaQuery("(min-width: 640px)");

  const router = useRouter();

  const isQrModalOpen = useLayoutStore((state) => state.isQrModalOpen);
  const openQrModal = useLayoutStore((state) => state.openQrModal);

  const openConfirmationModal = useLayoutStore(
    (state) => state.openConfirmationModal,
  );

  const {
    data: qrTransactionData,
    isLoading: isQrLoading,
    dataUpdatedAt: qrTransactionUpdatedAt,
  } = useQuery({
    queryKey: ["qr quote", swapQuoteUpdatedAt],
    queryFn: async () => {
      if (!swapQuote || !sourceToken) {
        throw new Error("Missing parameters to fetch transaction");
      }

      let linkUrl = "";
      if (sourceToken.isNative === true) {
        linkUrl = `ethereum:${transactionData.depositMeta.depositAddress}@${Number(transactionData.source.chainId)}?value=${convertToBaseE(swapQuote.sendAmount, swapQuote.sourceToken.decimals)}`;
      } else {
        linkUrl = `ethereum:${swapQuote.sourceToken.address}@${Number(transactionData.source.chainId)}/transfer?address=${transactionData.depositMeta.depositAddress}&uint256=${convertToBaseE(swapQuote.sendAmount, swapQuote.sourceToken.decimals)}`;
      }

      return { ...transactionData, linkUrl };
    },
    enabled: !!swapQuote && isQrModalOpen,
  });

  const pollTransactionHash = useCallback(
    async () => {
      if (!qrTransactionData?.depositMeta?.depositAddress) {
        throw new Error("Deposit address not available");
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_DEPAY_TRANSACTION_URL}/txnHash?da=${qrTransactionData.depositMeta.depositAddress}`,
      );
      if (!res.ok) {
        throw new Error("Failed to fetch transaction hash");
      }
      const txnHash = await res.json();

      if (txnHash === null || txnHash === undefined) {
        throw new Error("Transaction hash not found");
      }

      return txnHash?.txnHash;
    },
    [qrTransactionData], // Depend on transactionData in useCallback
  );

  const { data: txnHash } = useQuery({
    queryKey: ["transaction hash", qrTransactionUpdatedAt],
    queryFn: pollTransactionHash,
    enabled: !!qrTransactionData && isQrModalOpen,
    refetchInterval: 3000, // Poll every 3 seconds
    refetchOnWindowFocus: false, // Avoid refetching on window focus
    refetchIntervalInBackground: false,
    retry: false, // Disable retry logic as we control it manually
  });

  const transactionText = useMemo(() => {
    if (!swapQuote) return "Loading transaction details...";

    const sourceTokenAmount = formatUnits(
      BigInt(swapQuote?.quote?.source?.tokenAmount ?? "0"),
      swapQuote?.quote?.source.asset.decimals ?? 18,
    );

    const destTokenAmount = formatNumber(
      formatUnits(
        BigInt(swapQuote?.quote?.destination?.tokenAmount ?? "0"),
        swapQuote?.quote?.destination.asset.decimals ?? 18,
      ),
    );

    const transactionMessage = `Send ${sourceTokenAmount} ${swapQuote.sourceToken.name} on ${swapQuote.sourceChain.name} and receive ${destTokenAmount} ${swapQuote?.destToken.name} on ${swapQuote?.destChain.name}`;

    return transactionMessage;
  }, [swapQuote]);

  const handleQrModalOpenChange = (open: boolean) => {
    if (!open) {
      // open confirmation modal
      openConfirmationModal();
    } else {
      openQrModal();
    }
  };

  return (
    <>
      <CancelConfirmationModal />

      <Dialog open={isQrModalOpen} onOpenChange={handleQrModalOpenChange}>
        <DialogContent className="ht-sm:pt-32 h-full overflow-hidden border-none bg-transparent p-0 pt-16 outline-none">
          <div className=" relative flex max-h-[40rem] w-full flex-col gap-4 overflow-auto bg-background bg-border py-4">
            <DialogClose />
            <DialogHeader className="sticky top-0 px-6 py-1">
              <DialogTitle className="dark:text-brand-secondary font-normal tracking-wide text-slate-900">
                Scan to Pay
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-row gap-4 px-6">
              <div className="flex-1">
                {isQrLoading ? (
                  <div className="flex gap-2 pt-4 align-middle">
                    <p className="">Address :</p>
                    <div className="pt-1">loading</div>
                  </div>
                ) : (
                  <>
                    <p className="pt-4">Address :</p>
                    <div className="flex items-center gap-2">
                      <span>
                        {shortenAddress(
                          qrTransactionData?.depositMeta?.depositAddress,
                          7,
                        ) || "No account"}
                      </span>
                      <CopyButton
                        textToCopy={
                          qrTransactionData?.depositMeta?.depositAddress || ""
                        }
                        disabled={
                          !qrTransactionData?.depositMeta?.depositAddress
                        }
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="flex flex-1 items-center justify-center">
                <div className=" relative flex max-h-[40rem] w-full flex-col gap-4 overflow-auto bg-background bg-border">
                  <div className="flex items-center justify-center bg-white p-2">
                    {isQrLoading || !qrTransactionData ? (
                      <div className="flex h-40 w-40 items-center justify-center">
                        loading
                      </div>
                    ) : (
                      <QRCode
                        value={qrTransactionData.linkUrl}
                        bgColor="#FFFFFF"
                        fgColor="#000000"
                        size={160}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-2">
              <p>{transactionText}</p>
            </div>

            <div className="flex flex-row gap-4 px-6 pb-2 ">
              <NavigationButtons />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QrModal;
