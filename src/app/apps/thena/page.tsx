/* eslint-disable @next/next/no-img-element */
'use client';

import AmountInput from '@/components/AmountInput';
import CurrencyAndChainSelector from '@/components/CurrencyAndChainSelector';
import NetworkSelector from '@/components/NetworkSelector';
import QrModal from '@/components/QrModal';
import TokensSelector from '@/components/TokensSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { INTENTS_BASE_URI, QR_API_URI } from '@/constants';
import { CHAINS, type ChainIds } from '@/constants/chains';
import { TOKEN_MAP, TOKEN_SYMBOL_MAP, type Token } from '@/constants/tokens';
import { useWalletContext } from '@/context/WalletContext';
import useLayoutStore from '@/hooks/useLayoutStore';
import useTokenData from '@/hooks/useTokenData';
import { getSecondsToDurationString } from '@/lib/duration';
import { formatNumber } from '@/lib/formatNumber';
import { NATIVE, cn, getTokenLogoURI, isTokenETH } from '@/lib/utils';
import { QuoteApiResponse, type FeeQuoteCalldataResponse } from '@/types/intents';
import { useQuery } from '@tanstack/react-query';
import { ArrowDown, Info } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';
import { formatUnits, parseUnits, zeroAddress } from 'viem';

enum Pool {
  'stable' = 1,
  'volatile' = 2,
}

const TxButtons = dynamic(() => import('@/components/TxButton'), {
  ssr: false,
  loading: () => (
    <Button
      className='w-full'
      disabled
    >
      Loading...
    </Button>
  ),
});

const Page = () => {
  const openQrModal = useLayoutStore((state) => state.openQrModal);
  const closeQrModal = useLayoutStore((state) => state.closeQrModal);

  const [recipient, setRecipient] = useState('');
  const inputContainer = useRef<HTMLDivElement>(null);
  const [sourceChainId, setSourceChainId] = useState<ChainIds>('137');
  const [destChainId, setdestChainId] = useState<ChainIds>('56');
  const [sourceToken, setSourceToken] = useState<Token | undefined>();
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [debouncedStakeAmount] = useDebounceValue(stakeAmount, 1000);
  const [tokenA, setTokenA] = useState<Token | undefined>();
  const [tokenB, setTokenB] = useState<Token | undefined>();
  // const [feeTier, setFeeTier] = useState<string>('');
  const { currentAccount, currentChainId } = useWalletContext();
  const [pool, setPool] = useState(Pool.volatile);
  const tokenDisabled: string[] = useMemo(() => [], []);

  useEffect(() => {
    setSourceToken(TOKEN_MAP[sourceChainId]![NATIVE]);
  }, [sourceChainId]);

  const { tokenData, tokenBalance } = useTokenData({
    account: currentAccount?.address ?? '',
    chainId: sourceChainId,
    tokenAddress: sourceToken?.address ?? '',
  });

  const handleStakeAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // only set if val is valid number
    if (!isNaN(Number(e.target.value))) setStakeAmount(e.target.value);
  }, []);

  const { data: ethPrice, isLoading: isEthPriceLoading } = useQuery({
    queryKey: ['eth price'],
    queryFn: async () => {
      return await fetch(`https://price-api.crypto.com/price/v1/token-price/ethereum`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((res) => res.json().then((data) => data.usd_price));
    },
  });

  const {
    data: quote,
    error: quoteError,
    isLoading: isQuoteLoading,
  } = useQuery({
    queryKey: [
      'quote qr transaction',
      sourceChainId,
      debouncedStakeAmount,
      tokenA,
      tokenB,
      sourceToken,
      destChainId,
      pool,
      recipient,
      sourceToken?.address,
      sourceToken?.symbol,
      sourceToken?.decimals,
      tokenA?.address,
      tokenA?.symbol,
      tokenA?.decimals,
      tokenB?.address,
      tokenB?.symbol,
      tokenB?.decimals,
    ],
    queryFn: async () => {
      const data = await fetch(`${QR_API_URI}/adapter/transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          ReceiverAddress: recipient || zeroAddress,
          SourceTokens: [
            {
              chainId: sourceChainId,
              address: sourceToken?.address,
              name: sourceToken?.symbol,
              symbol: sourceToken?.symbol,
              decimals: sourceToken?.decimals,
            },
          ],
          DestinationTokens: [
            {
              chainId: destChainId,
              address: tokenA?.address,
              name: tokenA?.symbol,
              symbol: tokenA?.symbol,
              decimals: tokenA?.decimals,
            },
            {
              chainId: destChainId,
              address: tokenB?.address,
              name: tokenB?.symbol,
              symbol: tokenB?.symbol,
              decimals: tokenB?.decimals,
            },
          ],
          Amount: [parseUnits(debouncedStakeAmount, sourceToken!.decimals).toString()],
          SourceChainId: Number(sourceChainId),
          Protocol: [
            {
              protocolId: 'thena',
              chainId: destChainId,
              action: 'deposit',
              poolId: '',
              data: {
                stable: pool === 1 ? true : false,
              },
            },
          ],
        }),
      }).then((res) => res.json());

      if (!data) {
        throw new Error('No data');
      }
      if (data?.Errors?.length > 0) {
        throw new Error(data.Errors[0].Message.title);
      }

      return data as QuoteApiResponse;
    },
    enabled: !!(sourceToken && sourceChainId && debouncedStakeAmount && tokenA && tokenB && recipient),
    staleTime: 45_000, // 30 seconds
    retry: false,
  });

  const { data: feeQuote, isLoading: isFeeQuoteLoading } = useQuery({
    queryKey: ['thena fee quote', quote],
    queryFn: async () => {
      if (!quote?.quoteResponse) {
        throw new Error('No data');
      }
      // fetch calldata
      const data = await fetch(INTENTS_BASE_URI + '/router-intent/adapter/get-fee-params-from-adapter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quote.quoteResponse),
      }).then((res) => res.json());

      if (!data) {
        throw new Error('No data');
      }
      if (data?.Errors?.length > 0) {
        throw new Error(data.Errors[0].Message.title);
      }

      return data.PayLoad as FeeQuoteCalldataResponse;
    },
    enabled: !!(quote?.quoteResponse && !isQuoteLoading),
  });

  const balanceError = useMemo(() => {
    return !isQuoteLoading && Number(debouncedStakeAmount) > Number(tokenBalance?.formatted)
      ? new Error('Insufficient Funds')
      : undefined;
  }, [debouncedStakeAmount, tokenBalance, isQuoteLoading]);

  const bridgeFee = useMemo(() => {
    if (!feeQuote) return 0;

    const quoteBridgeFees = feeQuote.token;
    const feeAmount = feeQuote.totalFee;

    if (!feeAmount || !quoteBridgeFees) return 0;

    let bridgeFee = 0;

    const bridgeFeeReserve = Number(formatUnits(BigInt(feeAmount), quoteBridgeFees?.decimals || 18));
    const bridgeToken = quoteBridgeFees?.symbol;
    bridgeFee = bridgeToken === 'ETH' || bridgeToken === 'WETH' ? bridgeFeeReserve * ethPrice : bridgeFeeReserve;

    return bridgeFee;
  }, [ethPrice, feeQuote]);

  const tokenList = useMemo(() => {
    if (!destChainId) return [];
    if (!TOKEN_SYMBOL_MAP[destChainId]) return [];

    return Object.values(TOKEN_SYMBOL_MAP[destChainId]).filter((token) => !tokenDisabled?.includes(token.symbol));
  }, [destChainId, tokenDisabled]);

  return (
    <>
      <QrModal
        protocolQuote={quote?.quoteResponse}
        depositMeta={quote?.depositMeta}
        sourceToken={sourceToken}
        calldata={quote?.PayLoad}
      />
      <div className='mx-auto flex w-full flex-wrap justify-center gap-4'>
        <Card
          className='relative w-full overflow-clip rounded-2xl md:max-w-[50ch]'
          ref={inputContainer}
        >
          <CardHeader className=' gap-1'>
            <div>
              <CardTitle className='text-3xl text-lime-500'>Deposit Liquidity on Thena</CardTitle>
              <CardDescription>Powered by Router Intents</CardDescription>
            </div>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <CurrencyAndChainSelector
              setSourceChainId={setSourceChainId}
              setSourceToken={setSourceToken}
              sourceChainId={sourceChainId}
              sourceToken={sourceToken}
              testnet={false}
            />

            <AmountInput
              handleStakeAmountChange={handleStakeAmountChange}
              setStakeAmount={setStakeAmount}
              sourceChainId={sourceChainId}
              sourceToken={sourceToken}
              stakeAmount={stakeAmount}
              tokenBalance={tokenBalance}
            />
            <div className=' w-full'>
              <ArrowDown
                className='mx-auto h-5 w-5 shrink-0'
                color='white'
              />
            </div>

            <div className='flex w-full'>
              <NetworkSelector
                currentChainId={destChainId}
                setChain={setdestChainId}
                chains={[destChainId]}
                disabled
              />
            </div>

            <TokensSelector
              setTokenA={setTokenA}
              tokenA={tokenA}
              setTokenB={setTokenB}
              tokenB={tokenB}
              testnet={false}
              sourceChainId={destChainId}
              tokenList={tokenList}
            />

            <div className='mt-4 flex w-[220px] justify-between rounded-md bg-[#19191E]'>
              <div
                className={` ${pool === Pool.stable ? 'bg-[#fafafa] text-black' : 'text-neutral-300'} cursor-pointer rounded-l-md  px-2 py-1`}
                onClick={() => setPool(Pool.stable)}
              >
                Stable Pool
              </div>
              <div
                className={` ${pool === Pool.volatile ? 'bg-[#fafafa] text-black' : 'text-neutral-300'} cursor-pointer rounded-r-md px-2 py-1`}
                onClick={() => setPool(Pool.volatile)}
              >
                Volatile Pool
              </div>
            </div>
            <div className=' flex w-full justify-between'>
              <div className=' relative flex'>
                {tokenA ? (
                  <img
                    loading='eager'
                    src={getTokenLogoURI(tokenA.address, CHAINS[destChainId])}
                    alt={''}
                    width={20}
                    height={20}
                    className='h-10 w-10 rounded-full bg-white'
                    onError={(e) => {
                      (e.target as HTMLImageElement).onerror = null;
                      (e.target as HTMLImageElement).src = '/images/icons/unknown.png';
                    }}
                  />
                ) : (
                  <div className=' h-10 w-10 rounded-full border-[1px]'></div>
                )}
                {tokenB ? (
                  <img
                    loading='eager'
                    src={getTokenLogoURI(tokenB.address, CHAINS[destChainId])}
                    alt={''}
                    width={20}
                    height={20}
                    className=' absolute left-8 h-10 w-10 rounded-full bg-white '
                    onError={(e) => {
                      (e.target as HTMLImageElement).onerror = null;
                      (e.target as HTMLImageElement).src = '/images/icons/unknown.png';
                    }}
                  />
                ) : (
                  <div className='absolute left-8 h-10 w-10 rounded-full border-[1px]'></div>
                )}
              </div>

              <div className=' my-auto'>
                {tokenA ? `${pool === Pool.stable ? 'sAMM-' : 'vAMM-'}` + tokenA.symbol : '-'}
                {'/'}
                {tokenB ? tokenB.symbol : '-'}
              </div>
            </div>

            <div className='relative flex w-full flex-col justify-between gap-2'>
              <Label
                className=' font-normal'
                htmlFor=''
              >
                Recipient
              </Label>
              <div className='relative flex w-full'>
                <Input
                  className='w-full'
                  placeholder='Recipient address'
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
                <Button
                  onClick={(e: unknown) => {
                    void navigator.clipboard.readText().then(async (address) => {
                      // check if text is an address
                      if (address.length !== 42) return;
                      if (!address.startsWith('0x')) return;

                      setRecipient(address);
                    });
                  }}
                  variant='outline'
                  className='absolute right-2 top-2 h-6 w-12 p-1 text-xs'
                >
                  Paste
                </Button>
              </div>
            </div>

            <div className='flex gap-2 rounded-md bg-background/40 p-2 text-neutral-400'>
              <Info
                className='my-auto flex-shrink-0 text-lime-500'
                size={'20px'}
              />
              <span className='flex-grow text-xs text-white'>Make sure your assets correspond to the pool type.</span>
            </div>
          </CardContent>

          <CardFooter className='mt-8 flex flex-col gap-4'>
            <div className='grid w-full grid-cols-2 gap-2 rounded-xl border border-neutral-800 bg-background/25 p-2'>
              <div className={'flex flex-col gap-1 rounded-md bg-background/40 p-2 text-neutral-400'}>
                <span className='text-xs'>ETA</span>
                <span
                  className={cn(
                    'text-base font-medium text-neutral-300',
                    isQuoteLoading ? 'animate-pulse rounded-xs bg-foreground/10 text-transparent' : '',
                  )}
                >
                  {isQuoteLoading
                    ? 'Loading...'
                    : quote?.quoteResponse
                      ? getSecondsToDurationString(quote.quoteResponse?.estimatedTime ?? 0)
                      : '--'}
                </span>
              </div>
              <div className={'flex flex-col gap-1 rounded-md bg-background/40 p-2 text-neutral-400'}>
                <span className='text-xs'>Total Fee</span>
                <span
                  className={cn(
                    'text-base font-medium text-neutral-300',
                    isQuoteLoading || isFeeQuoteLoading
                      ? 'animate-pulse rounded-xs bg-foreground/10 text-transparent'
                      : '',
                  )}
                >
                  $ {isQuoteLoading || isFeeQuoteLoading ? 'Loading...' : formatNumber(bridgeFee)}
                </span>
              </div>
              <div className={'flex flex-col gap-1 rounded-md bg-background/40 p-2 text-neutral-400'}>
                <span className='text-xs'>Slippage</span>
                <span
                  className={cn(
                    'text-base font-medium text-neutral-300',
                    isQuoteLoading ? 'animate-pulse rounded-xs bg-foreground/10 text-transparent' : '',
                  )}
                >
                  {isQuoteLoading ? 'loading...' : quote?.quoteResponse?.quote?.[0]?.slippageTolerance ?? '--'}%
                </span>
              </div>
              <div className={'flex flex-col gap-1 rounded-md bg-background/40 p-2 text-neutral-400'}>
                <span className='text-xs'>Min Received</span>
                <span
                  className={cn(
                    'text-base font-medium  text-lime-500',
                    isQuoteLoading ? 'animate-pulse rounded-xs bg-foreground/10 text-transparent ' : '',
                  )}
                >
                  {isQuoteLoading
                    ? 'loading...'
                    : quote?.quoteResponse?.quote[quote?.quoteResponse.quote.length - 1]!.amountReceivedInEther
                      ? formatNumber(
                          quote?.quoteResponse?.quote[quote?.quoteResponse.quote.length - 1]!.amountReceivedInEther ||
                            0,
                        )
                      : '--'}{' '}
                </span>
              </div>
            </div>

            <TxButtons
              className='w-full'
              chainId={sourceChainId}
              label={'Pay to add liquidity'}
              error={quoteError ?? balanceError}
              handleComplete={() => {}}
              handleTransaction={() => {
                openQrModal();
              }}
              isDisabled={!quote || isQuoteLoading || isQuoteLoading}
              isLoading={isQuoteLoading}
              isSubmitting={false}
              success={false}
              errorLabel={
                quoteError ? quoteError.message : balanceError ? balanceError.message : 'Something went wrong'
              }
              loadingLabel={isQuoteLoading ? 'Building Transaction' : isQuoteLoading ? 'Fetching Quote' : undefined}
              successLabel='Staked Successfully'
            />
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default Page;
