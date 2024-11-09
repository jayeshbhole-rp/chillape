import CopyIcon from "@/assets/icons/copy.svg";
import TickIcon from "@/assets/icons/tick.svg";
import { useState } from "react";
import { useCopyToClipboard } from "usehooks-ts";
import { Button, type ButtonProps } from "./button";

interface CopyButtonProps extends ButtonProps {
  textToCopy: string | undefined;
  children?: React.ReactNode;
}

const CopyButton: React.FC<CopyButtonProps> = ({
  textToCopy,
  children,
  disabled,
  ...props
}) => {
  const [copied, setCopied] = useState(false);
  const [, copy] = useCopyToClipboard();

  const handleCopy = async () => {
    if (!textToCopy || disabled) {
      console.error("No text to copy or button is disabled");
      return;
    }
    const success = await copy(textToCopy);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Show tick for 2 seconds
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className="flex h-8 w-8 gap-4"
      onClick={handleCopy}
      disabled={disabled}
      {...props}
    >
      {copied ? (
        <TickIcon className="h-5 w-5" />
      ) : (
        <CopyIcon className="h-5 w-5" />
      )}
      {children}
    </Button>
  );
};

export default CopyButton;
