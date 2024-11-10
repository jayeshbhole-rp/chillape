'use client';

import { useWalletContext } from '@/context/WalletContext';
import { emojiAvatarForAddress } from '@/lib/emojiAvatarForAddress';
import { cn } from '@/lib/utils';
import { useEffect, useMemo } from 'react';
import { zeroAddress } from 'viem';
import { Button } from '../ui/button';
import { useUserContext } from '@/context/UserContext';

const WalletButton = () => {
  const { currentAccount, openWalletModal } = useWalletContext();
  const { first_name, last_name, id, photo_url, isAuthenticated, username, initializeAuth } = useUserContext();

  const { color: backgroundColor, emoji } = useMemo(
    () =>
      emojiAvatarForAddress(currentAccount?.address ?? zeroAddress) ?? {
        color: '#FFDD86',
        emoji: '🌞',
      },
    [currentAccount?.address],
  );

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Button
      onClick={openWalletModal}
      disabled={isAuthenticated}
      className='gap-1 rounded-full'
    >
      {isAuthenticated ? (
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-3xl text-base leading-none',
            '-ml-3 select-none bg-slate-700',
          )}
          style={{ backgroundColor }}
        >
          <img
            src={photo_url}
            alt='img'
            className='h-5 w-5'
          />

          {username ?? id}
        </div>
      ) : currentAccount ? (
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-3xl text-base leading-none',
            '-ml-3 select-none bg-slate-700',
          )}
          style={{ backgroundColor }}
        >
          <span className='drop-shadow-[0px_0px_4px_#ffffff]'>{emoji}</span>

          {currentAccount && `${currentAccount?.address?.slice(0, 6)}...${currentAccount?.address?.slice(-4)}`}
        </div>
      ) : (
        'Connect Wallet'
      )}
    </Button>
  );
};

export const DefaultWalletButton = () => {
  return <Button className='rounded-full'>Connect Wallet</Button>;
};

export default WalletButton;
