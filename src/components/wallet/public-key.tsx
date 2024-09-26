import { useEffect } from 'react';
import { usePubkey } from '@/hooks/public-key';
import type { ChainInfo } from '@/hooks/wallet';

export default function Pubkey({ address, chainInfo }: PubkeyProps) {
  const { pubkey, loading, getPubkey, getPubkeyFromServer, resetPubkey } =
    usePubkey();

  useEffect(() => {
    if (typeof pubkey !== 'undefined' && !address) {
      resetPubkey();
    }
  }, [address, pubkey, resetPubkey]);

  return (
    <div className="flex border h-10 p-1 items-center">
      {address && (
        <>
          <div>
            <button onClick={() => getPubkey(address)}>publicKey</button>
            <button
              onClick={() => getPubkeyFromServer(address, chainInfo?.chainId)}
            >
              server
            </button>
          </div>
          <div>&nbsp;&nbsp;</div>
          <div>
            <span className="font-mono">(secp256k1):&nbsp;</span>
            {loading && <span>Please wait..</span>}
            {!loading && typeof pubkey === 'string' && (
              <span className="text-violet-500">
                {pubkey && pubkey.substring(0, 45)}&hellip;
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export interface PubkeyProps {
  address: string | undefined;
  chainInfo: ChainInfo | undefined;
}
