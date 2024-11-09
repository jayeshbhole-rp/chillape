'use client';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

const TxButtons = ({
  label,
  className,
  isLoading,
  loadingLabel,
  isDisabled,
  isSubmitting,
  error,
  errorLabel,
  success,
  successLabel,
  handleTransaction,
  handleComplete,
  chainId,
}: {
  chainId: string;
  handleTransaction: () => void;
  handleComplete: () => void;
  label: string;
  className?: string;
  isLoading: boolean;
  loadingLabel?: string;
  isDisabled: boolean;
  isSubmitting: boolean;
  error: Error | null | undefined;
  errorLabel?: string;
  success: boolean;
  successLabel?: string;
}) => {
  if (error) {
    return (
      <Button
        className={cn('cursor-not-allowed opacity-75', className)}
        disabled={true}
      >
        {errorLabel ?? error.message}
      </Button>
    );
  }

  if (success) {
    return (
      <Button
        className={className}
        disabled={isDisabled}
        onClick={handleComplete}
      >
        {successLabel}
      </Button>
    );
  }

  if (isLoading) {
    return (
      <Button
        className={cn('animate-pulse cursor-not-allowed', className)}
        disabled={isDisabled}
      >
        {loadingLabel ?? 'Loading...'}
      </Button>
    );
  }

  return (
    <Button
      className={className}
      onClick={handleTransaction}
      disabled={isDisabled || isSubmitting}
    >
      {label}
    </Button>
  );
};

export default TxButtons;
