import Header from '@/components/Header';
import { cn } from '@/lib/utils';
import { ArrowUpRight, Lock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const intentApps: {
  name: string;
  link: string;
  disabled?: boolean;
  external?: string;
}[] = [{ name: 'thena', link: '/apps/thena' }];

const Page = () => {
  return (
    <>
      <Header />

      <main className='relative mx-auto mt-16 flex min-h-[calc(100vh_-_10rem)] max-w-[1600px] flex-col gap-8  p-4 px-8'>
        <div className='flex items-center justify-center'>
          <Image
            src='/logo.png'
            alt=''
            width={512}
            height={512}
            className='-top-8 left-1/2 -z-[1] w-16 -translate-x-1/2'
          />
          <h1 className='text-center text-4xl text-lime-500'>All Intent Dapps</h1>
        </div>

        <div className='mx-auto flex w-full max-w-[40ch] flex-col gap-2'>
          {intentApps.map((app) => (
            <Link
              key={app.link}
              href={!app.disabled ? app.link : ''}
              className={cn(
                'flex h-12 items-center justify-between rounded-md border border-neutral-600 px-4 transition-all hover:bg-neutral-900 hover:text-lime-500 ',
                app.disabled && 'cursor-not-allowed text-neutral-500  hover:text-neutral-500',
              )}
            >
              / {app.name}
              <div className='flex gap-1'>
                {app.external && <ArrowUpRight className={cn('h-6 w-6', !app.disabled && ' text-lime-500')} />}
                {app.disabled && <Lock className='h-5 w-5 text-neutral-500' />}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
};

export default Page;
