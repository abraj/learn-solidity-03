import { useConnect } from '@/utils/wallet';
import { useEffect } from 'react';

export default function Connect({ setAccount }: ConnectProps) {
  const { status: state, handleConnect, handleDisconnect } = useConnect();
  const { status, account, message } = state ?? {};

  useEffect(() => {
    setAccount(account);
  }, [setAccount, account]);

  return (
    <div className="flex border h-10 items-center">
      <div>
        {typeof status === 'undefined' ? (
          <div>{/* Please wait.. */}</div>
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
  setAccount: (v: string | undefined) => void;
}
