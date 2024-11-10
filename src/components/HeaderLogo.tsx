'use client';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const HeaderLogo = () => {
  const pathname = usePathname();

  if (pathname.startsWith('/tx')) {
    return (
      <div className='grid grid-cols-[1.25rem,_1fr] items-center gap-2 gap-y-0 sm:grid-cols-[2.5rem,_1fr]'>
        <Image
          src={`/images/partners/tx.png`}
          width={256}
          height={256}
          alt='Router Intents'
          className='h-5 w-5 sm:h-10 sm:w-10'
        />
        <span className='text-xl capitalize leading-none sm:text-2xl'>Transaction</span>

        <div className=''></div>
      </div>
    );
  }
  if (pathname.startsWith('/all')) {
    return (
      <div className='grid grid-cols-[1.25rem,_1fr] items-start gap-2 gap-y-0 justify-self-start sm:grid-cols-[2.5rem,_1fr]'>
        <Image
          src={`/images/partners/tx.png`}
          width={256}
          height={256}
          alt='Router Intents'
          className='h-5 w-5 sm:h-10 sm:w-10'
        />
        <div className=''></div>
      </div>
    );
  }
  return (
    <div className='grid grid-cols-[1.25rem,_1fr] items-center gap-2 gap-y-0 justify-self-start sm:grid-cols-[2.5rem,_1fr]'>
      <Image
        src={`/images/partners/${pathname.split('/apps/')?.[1] === 'lido-testnet' ? 'lido' : pathname.split('/apps/')?.[1]}.png`}
        width={256}
        height={256}
        alt='Router Intents'
        className='h-5 w-5 sm:h-10 sm:w-10'
      />
      <span className='text-xl capitalize leading-none sm:text-2xl'>{pathname.split('/apps/')?.[1]}</span>

      <div className=''></div>
    </div>
  );
};

export default HeaderLogo;
