import { clsx } from 'clsx';
import { switchChain } from '@/utils/chain';
import type { ChainInfo } from '@/hooks/wallet';

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
          <div>&nbsp;&nbsp;</div>
          {chainInfo.chainIdHex !== '0x1' && (
            <div className="text-sm">
              <button onClick={() => switchChain()}>Switch</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export interface WalletHeaderProps {
  chainInfo: ChainInfo | undefined;
}
