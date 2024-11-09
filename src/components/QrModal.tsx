'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';
import QRCode from 'react-qr-code';
import { useMediaQuery } from 'usehooks-ts';
import { formatUnits } from 'viem';
import useLayoutStore from '../hooks/useLayoutStore';
import { formatNumber } from '../lib/formatNumber';
import { NATIVE, shortenAddress, updateDbTransaction } from '../lib/utils';
import { convertToBaseE } from '../lib/utils/convertToBaseE';
import CancelConfirmationModal from './CancelConfirmationModal';
import { Button } from './ui/button';
import CopyButton from './ui/CopyButton';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ComposeCalldataResponse, DepositMeta, ProtocolParamsResponse } from '@/types/intents';
import { Token } from '@/constants/tokens';
import { QR_API_URI } from '@/constants';

const NavigationButtons = () => {
  const openConfirmationModal = useLayoutStore((state) => state.openConfirmationModal);

  return (
    <>
      <Button
        className='flex-1 opacity-75 hover:opacity-100'
        variant='destructive'
        onClick={openConfirmationModal}
      >
        Cancel request
      </Button>
    </>
  );
};

const QrModal = ({
  protocolQuote,
  depositMeta,
  calldata,
  sourceToken,
}: {
  protocolQuote: ProtocolParamsResponse | undefined;
  calldata: ComposeCalldataResponse | undefined;
  depositMeta: DepositMeta | undefined;
  sourceToken: Token | undefined;
}) => {
  const router = useRouter();

  const isQrModalOpen = useLayoutStore((state) => state.isQrModalOpen);
  const openQrModal = useLayoutStore((state) => state.openQrModal);

  const openConfirmationModal = useLayoutStore((state) => state.openConfirmationModal);

  let linkUrl = '';
  if (depositMeta && protocolQuote) {
    if (sourceToken?.address === NATIVE) {
      linkUrl = `ethereum:${depositMeta.depositAddress}@${Number(protocolQuote.sourceChainId)}?value=${convertToBaseE(protocolQuote.amount[0], protocolQuote.sourceTokens[0].decimals!)}`;
    } else {
      linkUrl = `ethereum:${protocolQuote.sourceTokens[0].address}@${Number(protocolQuote.sourceChainId)}/transfer?address=${depositMeta.depositAddress}&uint256=${convertToBaseE(protocolQuote.amount[0], protocolQuote.sourceTokens[0].decimals!)}`;
    }
  }

  const pollTransactionHash = useCallback(
    async () => {
      if (!depositMeta?.depositAddress) {
        throw new Error('Deposit address not available');
      }

      const res = await fetch(`${QR_API_URI}/crosschain/txnHash?da=${depositMeta.depositAddress}`);
      if (!res.ok) {
        throw new Error('Failed to fetch transaction hash');
      }
      const txnHash = await res.json();

      if (txnHash === null || txnHash === undefined) {
        throw new Error('Transaction hash not found');
      }

      return txnHash?.txnHash as string;
    },
    [depositMeta?.depositAddress], // Depend on transactionData in useCallback
  );

  const { data: txnHash } = useQuery({
    queryKey: ['transaction hash', depositMeta],
    queryFn: pollTransactionHash,
    enabled: !!depositMeta && isQrModalOpen,
    refetchInterval: 3000, // Poll every 3 seconds
    refetchOnWindowFocus: false, // Avoid refetching on window focus
    refetchIntervalInBackground: false,
    retry: false, // Disable retry logic as we control it manually
  });

  useEffect(() => {
    if (txnHash) {
      void updateDbTransaction({
        id: calldata?.trnxId as string,
        hash: txnHash,
        status: 'COMPLETED',
        gasFee: '0',
      }).then(() => {
        // open tx page
        router.push(`/tx/${txnHash}`);
      });
    }
  }, [calldata?.trnxId, router, txnHash]);

  const transactionText = useMemo(() => {
    if (!protocolQuote) return 'Loading transaction details...';

    const sourceTokenAmount = formatUnits(
      BigInt(protocolQuote?.amount[0] ?? '0'),
      protocolQuote?.sourceTokens[0].decimals ?? 18,
    );

    const transactionMessage = `Send ${sourceTokenAmount} ${protocolQuote.sourceTokens[0].name} to provide liqudity into Thena`;

    return transactionMessage;
  }, [protocolQuote]);

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

      <Dialog
        open={isQrModalOpen}
        onOpenChange={handleQrModalOpenChange}
      >
        <DialogContent className='overflow-hidden border-none bg-transparent p-0 pt-16 outline-none ht-sm:pt-32'>
          <div className=' relative flex max-h-[40rem] w-full flex-col gap-4 overflow-auto bg-background py-4'>
            <DialogClose />
            <DialogHeader className='sticky top-0 px-6 py-1'>
              <DialogTitle className='font-normal tracking-wide'>Scan to Pay</DialogTitle>
            </DialogHeader>

            <div className='flex flex-row gap-4 px-6'>
              <div className='flex-1'>
                {!protocolQuote ? (
                  <div className='flex gap-2 pt-4 align-middle'>
                    <p className=''>Address :</p>
                    <div className='pt-1'>Fetching address</div>
                  </div>
                ) : (
                  <>
                    <p className='pt-4'>Address :</p>
                    <div className='flex items-center gap-2'>
                      <span>{shortenAddress(depositMeta?.depositAddress, 7) || 'No account'}</span>
                      <CopyButton
                        textToCopy={depositMeta?.depositAddress || ''}
                        disabled={!depositMeta?.depositAddress}
                      />
                    </div>
                  </>
                )}
              </div>
              <div className='flex flex-1 items-center justify-center'>
                <div className=' relative flex max-h-[40rem] w-full flex-col gap-4 overflow-auto bg-background'>
                  <div className='flex items-center justify-center bg-white p-2'>
                    {!linkUrl ? (
                      <div className='flex h-40 w-40 items-center justify-center'>Building payment link</div>
                    ) : (
                      <QRCode
                        value={linkUrl}
                        bgColor='#FFFFFF'
                        fgColor='#000000'
                        size={160}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className='px-6 py-2'>
              <p>{transactionText}</p>
              <br />
              <p>Please wait here to keep a track of your request.</p>
            </div>

            <div className='flex flex-row gap-4 px-6 pb-2 '>
              <NavigationButtons />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QrModal;
