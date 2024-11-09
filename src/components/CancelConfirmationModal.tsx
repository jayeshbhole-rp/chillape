"use client";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useEffect } from "react";
import { useMediaQuery } from "usehooks-ts";
import { Drawer as DrawerPrimitive } from "vaul";
import { formatUnits } from "viem";
import { Button } from "./ui/button";
import { formatNumber } from "../lib/formatNumber";
import useLayoutStore from "../hooks/useLayoutStore";

const NavigationButtons = () => {
  const closeConfirmationModal = useLayoutStore(
    (state) => state.closeConfirmationModal,
  );
  const closeQrModal = useLayoutStore((state) => state.closeQrModal);

  const handleYesClick = () => {
    closeConfirmationModal();
    closeQrModal();
  };

  return (
    <div className="flex flex-row gap-4 px-6 pb-2 ">
      <Button
        className="flex-1"
        variant="outline"
        onClick={closeConfirmationModal}
      >
        No, keep waiting
      </Button>
      <Button className="flex-1" variant="destructive" onClick={handleYesClick}>
        Yes, cancel request
      </Button>
    </div>
  );
};

const CancelConfirmationModal = () => {
  const isDesktop = useMediaQuery("(min-width: 640px)");

  const isConfirmationModalOpen = useLayoutStore(
    (state) => state.isConfirmationModalOpen,
  );
  const setConfirmationModalOpen = useLayoutStore(
    (state) => state.setConfirmationModalOpen,
  );
  const isQrModalOpen = useLayoutStore((state) => state.isQrModalOpen);

  useEffect(() => {
    const handleTabClose = (event: {
      preventDefault: () => void;
      returnValue: string;
    }) => {
      if (isQrModalOpen) {
        event.preventDefault();
        setConfirmationModalOpen(true);
        event.returnValue = ""; // For some browsers to show a prompt
      }
    };
    window.addEventListener("beforeunload", handleTabClose);
    return () => {
      window.removeEventListener("beforeunload", handleTabClose);
    };
  }, [isQrModalOpen, setConfirmationModalOpen]);

  if (isDesktop) {
    return (
      <Dialog
        open={isConfirmationModalOpen}
        onOpenChange={setConfirmationModalOpen}
      >
        <DialogContent className="ht-sm:pt-32 h-full overflow-hidden border-none bg-transparent p-0 pt-16 outline-none">
          <div className=" relative flex max-h-[40rem] w-full flex-col gap-4 overflow-auto bg-background py-4">
            <DialogClose />
            <DialogHeader className="sticky top-0 px-6 py-1">
              <DialogTitle className="dark:text-brand-secondary font-normal tracking-wide text-slate-900">
                Are you sure you want to cancel ?
              </DialogTitle>
            </DialogHeader>

            <div className="px-6 py-2">
              <p>
                Please do not close this model if you have paid funds from your
                wallet.
              </p>
            </div>

            <NavigationButtons />
          </div>
        </DialogContent>
      </Dialog>
    );
  }
};

export default CancelConfirmationModal;