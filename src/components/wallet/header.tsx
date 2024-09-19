import { ChainInfo } from '@/utils/wallet';
import { clsx } from 'clsx';

export default function WalletHeader({ chainInfo }: WalletHeaderProps) {
  const { name, type } = chainInfo ?? {};

  return (
    <div
      className={clsx('flex h-10 p-2 items-center', {
        'bg-yellow-100': type === 'testnet',
        'bg-red-100': type === 'unknown',
      })}
    >
      {chainInfo && (
        <>
          <div className="font-bold">Chain:</div>
          <div>&nbsp;&nbsp;</div>
          <div
            className={clsx({
              'text-green-600': type === 'mainnet',
              'text-yellow-600': type === 'testnet',
              'text-red-600': type === 'unknown',
            })}
          >
            {name}
          </div>
        </>
      )}
    </div>
  );
}

export interface WalletHeaderProps {
  chainInfo: ChainInfo | undefined;
}
