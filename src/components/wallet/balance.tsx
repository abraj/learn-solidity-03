import { useBalance } from '@/utils/wallet';

export default function Balance({ address }: BalanceProps) {
  const [balance, loading, getBalance] = useBalance();
  return (
    <div className="flex border h-10 items-center">
      {address && (
        <>
          <div>
            <button onClick={() => getBalance(address)}>getBalance</button>
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
}
