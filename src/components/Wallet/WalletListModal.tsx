'use client';

import { WALLETS } from '@/constants/wallets';
import { useWalletContext } from '@/context/WalletContext';
import { getWallet } from '@/lib/walletUtils';
import { NetworkType } from '@/types/WalletContextTypes';
import Image from 'next/image';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { useConnect } from 'wagmi';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '../ui/command';

export function WalletListModal({ open, setOpen }: { open: boolean; setOpen: Dispatch<SetStateAction<boolean>> }) {
  const { connectWallet, connectedWallets, currentWallet } = useWalletContext();
  const { connectors: evmConnectors } = useConnect();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [setOpen]);

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
    >
      <CommandInput placeholder='Search a wallet...' />
      <CommandList className='max-h-[600px] pb-1'>
        <CommandEmpty>No wallets.</CommandEmpty>

        <CommandGroup heading='Ethereum'>
          {evmConnectors.map((wallet, index) => (
            <CommandItem
              key={`${index} ${wallet.name}`}
              value={wallet.name}
              disabled={Boolean(
                (!getWallet(wallet.id, wallet) || getWallet(wallet.id, wallet)?.disabled) ??
                  connectedWallets['evm']?.[wallet.id]?.loading,
              )}
              onSelect={() => connectWallet(wallet.id)}
              className='flex cursor-pointer gap-2'
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className='h-6 w-6 rounded-[0.5rem] '
                alt=''
                src={wallet.icon ?? getWallet(wallet.id)?.icon ?? '/images/icons/unknown.png'}
              />
              <span>{wallet.name}</span>

              <span className='ml-auto'></span>

              {currentWallet?.id === wallet.id && (
                <span className='h-2 w-2 rounded-sm bg-green-400 p-1 outline outline-2 outline-offset-2 outline-green-800' />
              )}

              {connectedWallets['evm'][wallet.id]?.loading && (
                <span className='rounded-xs bg-neutral-700 px-2 py-1 font-mono text-xs'>Loading...</span>
              )}
              {connectedWallets['evm'][wallet.id]?.address && (
                <span className='rounded-xs bg-neutral-700 px-2 py-1 font-mono text-xs'>
                  {connectedWallets['evm'][wallet.id]?.address.slice(0, 6)}
                  ...
                  {connectedWallets['evm'][wallet.id]?.address.slice(-4)}
                </span>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading='Tron'>
          {WALLETS.filter((wallet) => wallet.type === NetworkType.TRON).map((wallet, index) => (
            <CommandItem
              key={`${index} ${wallet.id}`}
              value={wallet.id}
              disabled={
                (!getWallet(wallet.id) || getWallet(wallet.id)?.disabled) ??
                connectedWallets['tron'][wallet.id]?.loading
              }
              onSelect={() => {
                connectWallet(wallet.id);
              }}
              className='flex cursor-pointer gap-2'
            >
              <Image
                className='h-6 w-6 rounded-[0.5rem]'
                alt=''
                src={wallet.icon}
                width={128}
                height={128}
              />
              <span>{wallet.name}</span>

              {connectedWallets['tron'][wallet.id]?.loading && (
                <span className='rounded-xs bg-neutral-700 px-2 py-1 font-mono text-xs'>Loading...</span>
              )}

              <span className='ml-auto'></span>

              {currentWallet?.id === wallet.id && (
                <span className='h-2 w-2 rounded-sm bg-green-400 p-1 outline outline-2 outline-offset-2 outline-green-800' />
              )}

              {connectedWallets['tron'][wallet.id]?.address && (
                <span className='rounded-xs bg-neutral-700 px-2 py-1 font-mono text-xs'>
                  {connectedWallets['tron'][wallet.id]?.address.slice(0, 6)}
                  ...
                  {connectedWallets['tron'][wallet.id]?.address.slice(-4)}
                </span>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading='Cosmos'>
          {WALLETS.filter((wallet) => wallet.type === NetworkType.COSMOS).map((wallet, index) => (
            <CommandItem
              key={`${index} ${wallet.id}`}
              value={wallet.id}
              disabled={wallet.disabled ?? connectedWallets['cosmos'][wallet.id]?.loading}
              onSelect={() => {
                connectWallet(wallet.id);
              }}
              className='flex cursor-pointer gap-2'
            >
              <Image
                className='h-6 w-6 rounded-[0.5rem]'
                alt=''
                src={wallet.icon}
                width={128}
                height={128}
              />
              <span>{wallet.name}</span>

              <span className='ml-auto'></span>

              {connectedWallets['cosmos'][wallet.id]?.loading && (
                <span className='rounded-xs bg-neutral-700 px-2 py-1 font-mono text-xs'>Loading...</span>
              )}
              {connectedWallets['cosmos'][wallet.id]?.address && (
                <span className='rounded-xs bg-neutral-700 px-2 py-1 font-mono text-xs'>
                  {connectedWallets['cosmos'][wallet.id]?.address.slice(0, 6)}
                  ...
                  {connectedWallets['cosmos'][wallet.id]?.address.slice(-4)}
                </span>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
