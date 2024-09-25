import { useEffect } from 'react';
import { useBalance } from '@/hooks/wallet';
import type { ChainInfo } from '@/hooks/wallet';

export default function Balance({ address, chainInfo }: BalanceProps) {
  const { balance, loading, getBalance, getBalanceFromServer, resetBalance } =
    useBalance();

  useEffect(() => {
    if (typeof balance !== 'undefined' && !address) {
      resetBalance();
    }
  }, [address, balance, resetBalance]);

  return (
    <div className="flex border h-10 p-1 items-center">
      {address && (
        <>
          <div>
            <button onClick={() => getBalance(address)}>getBalance</button>
            <button
              onClick={() => getBalanceFromServer(address, chainInfo?.chainId)}
            >
              server
            </button>
          </div>
          <div>&nbsp;&nbsp;</div>
          <div>
            {loading && <span>Please wait..</span>}
            {!loading && typeof balance === 'number' && (
              <span className="text-violet-500">{balance} ETH</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export interface BalanceProps {
  address: string | undefined;
  chainInfo: ChainInfo | undefined;
}
