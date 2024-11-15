'use client';
import Header from '@/components/Header';
import IntentTransaction from '@/components/Transaction/IntentTransaction';
import { useParams } from 'next/navigation';

const Page = () => {
  const params = useParams<{
    txHash: string;
  }>();

  return (
    <>
      <Header mode='app' />

      <main className='relative mx-auto mt-16 flex min-h-[calc(100vh_-_10rem)] max-w-[1600px] flex-col gap-8  p-4 px-8'>
        <h1 className='text-center text-4xl text-amber-500'>Track Transaction</h1>
        <div>
          <IntentTransaction txHash={params.txHash} />
        </div>
      </main>
    </>
  );
};

export default Page;
