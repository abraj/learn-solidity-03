import { useConnect } from '@/utils/wallet';
import { useEffect } from 'react';

export default function Connect({ setAccount }: ConnectProps) {
  const [status, msg, account, handleConnect] = useConnect();

  useEffect(() => {
    setAccount(account);
  }, [setAccount, account]);

  return (
    <div className="flex border h-10 items-center">
      <div>
        {status !== 'connected' ? (
          <button onClick={() => handleConnect()}>Connect</button>
        ) : (
          <span className="font-bold text-green-600">{msg}</span>
        )}
      </div>
      <div>&nbsp;&nbsp;</div>
      <div>
        {status && status === 'connected' && (
          <span className="text-violet-500">{account}</span>
        )}
        {status && status !== 'connected' && (
          <span className="text-red-500">{msg}</span>
        )}
      </div>
    </div>
  );
}

interface ConnectProps {
  setAccount: (v: string | undefined) => void;
}
