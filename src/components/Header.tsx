import dynamic from "next/dynamic";

import { Button } from "./ui/button";

// import WalletButton from './Wallet/WalletButton';

const WalletButton = dynamic(() => import("./Wallet/WalletButton"), {
  ssr: false,
  loading: () => <Button className="rounded-full">Connect Wallet</Button>,
});

const HeaderLogo = dynamic(() => import("./HeaderLogo"), {
  loading: () => <div className="h-12 w-32"></div>,
});

const Header = ({ mode }: { mode?: "app" | "normal" }) => {
  return (
    <header className="z-[50] mx-auto mt-4 grid w-full max-w-[1600px] grid-cols-[10rem,_1fr,_10rem] items-center justify-items-center p-4 px-8">
      {<HeaderLogo />}

      <div className=""></div>

      {mode === "app" && <WalletButton />}
    </header>
  );
};

export default Header;
