import { useEffect } from 'react';
import { useConnect } from '@/utils/wallet';
import type { ChainInfo } from '@/utils/wallet';

export default function Connect({ setWalletAccount }: ConnectProps) {
  const { status: state, handleConnect, handleDisconnect } = useConnect();
  const { status, chainInfo, account, message } = state ?? {};

  useEffect(() => {
    setWalletAccount({ address: account, chainInfo });
  }, [setWalletAccount, account, chainInfo]);

  return (
    <div className="flex border h-10 p-1 items-center">
      <div>
        {typeof status === 'undefined' ? (
          <div>Please wait..</div>
        ) : status !== 'connected' ? (
          <button onClick={() => handleConnect()}>Connect</button>
        ) : (
          <button onClick={() => handleDisconnect()}>Disconnect</button>
        )}
      </div>
      <div>&nbsp;&nbsp;</div>
      <div>
        {status && status === 'connected' && (
          <span className="text-violet-500">{account}</span>
        )}
        {status && status !== 'connected' && (
          <span className="text-red-500">{message}</span>
        )}
      </div>
    </div>
  );
}

interface ConnectProps {
  setWalletAccount: (v: WalletAccount | undefined) => void;
}

export interface WalletAccount {
  address: string | undefined;
  chainInfo: ChainInfo | undefined;
}
