import { useEffect } from 'react';
import { useTxn } from '@/hooks/wallet';
import type { ChainInfo } from '@/hooks/wallet';

export default function SendTxn({ address, chainInfo }: TxnProps) {
  const { hash, loading, submitForm, resetHash } = useTxn();

  useEffect(() => {
    if (typeof hash !== 'undefined' && !address) {
      resetHash();
    }
  }, [address, hash, resetHash]);

  const alias = chainInfo?.alias;
  const prefix = alias && alias !== 'ethereum' ? `${alias}.` : '';
  return (
    <div className="flex border h-10 p-1 items-center">
      {address && (
        <>
          <form className="flex" onSubmit={submitForm}>
            <input type="hidden" name="submitter" value="" />
            <input type="hidden" name="address" value={address} />
            <input type="hidden" name="chainId" value={chainInfo?.chainId} />
            <button
              onClick={(e) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (e.target as any).parentElement.children[0].value = 'button1';
              }}
            >
              Send ETH
            </button>
            <button
              onClick={(e) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (e.target as any).parentElement.children[0].value = 'button2';
              }}
            >
              server
            </button>
            <div>&nbsp;</div>
            <input
              name="amount"
              type="number"
              step="0.0001"
              className="w-16 border border-gray-300 rounded px-1"
            />
            <div>&nbsp;</div>
            <input
              name="toAddress"
              type="text"
              className="border border-gray-300 rounded px-1"
              defaultValue={
                address === '0x2ed69cd751722fc552bc8c521846d55f6bd8f090'
                  ? `0x8858ebf9a19baf281624e571ef8309696d991fde`
                  : ''
              }
            />
          </form>
          <div>&nbsp;&nbsp;</div>
          <div>
            {loading && <span>Please wait..</span>}
            {!loading && typeof hash === 'string' && (
              <a
                href={`https://${prefix}etherscan.io/tx/${hash}`}
                target="_blank"
                className="text-violet-500"
              >
                {hash.substring(0, 15)}&hellip;
              </a>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export interface TxnProps {
  address: string | undefined;
  chainInfo: ChainInfo | undefined;
}
