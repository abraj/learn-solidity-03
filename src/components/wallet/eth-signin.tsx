import { useEffect } from 'react';
import { useEthSignIn } from '@/hooks/eth-signin';

export default function EthSignIn({ address }: EthSignInProps) {
  const { sign, verified, loading, startEthSignIn, resetEthSignIn } =
    useEthSignIn();

  useEffect(() => {
    if (typeof sign !== 'undefined' && !address) {
      resetEthSignIn();
    }
  }, [address, sign, resetEthSignIn]);

  return (
    <div className="flex border h-10 p-1 items-center">
      {address && (
        <>
          <div>
            <button onClick={() => startEthSignIn(address)}>
              Sign-in with Ethereum
            </button>
          </div>
          <div>&nbsp;&nbsp;</div>
          <div>
            {loading && <span>Please wait..</span>}
            {!loading && (
              <>
                {verified ? (
                  <>
                    <span className="text-violet-500">
                      {sign && sign.substring(0, 15)}&hellip;
                    </span>
                    <span>&nbsp;</span>
                    <span className="text-green-600">(Verified)</span>
                  </>
                ) : (
                  <span className="text-red-600">Not Verified</span>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export interface EthSignInProps {
  address: string | undefined;
}
