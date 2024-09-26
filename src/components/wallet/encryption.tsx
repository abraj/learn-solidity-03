import { useCallback, useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useEncryptionDemo } from '@/hooks/encryption';

export default function EncryptionDemo({ address }: TxnProps) {
  const [secret, setSecret] = useState('Hello, World!');
  const { message, encPubkey, loading, tryEncryption, resetMessage } =
    useEncryptionDemo();

  useEffect(() => {
    if (typeof message !== 'undefined' && !address) {
      resetMessage();
    }
  }, [address, message, resetMessage]);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSecret(e.target.value);
  }, []);

  return (
    <div className="flex border h-10 p-1 items-center">
      {address && (
        <>
          <div className="flex">
            <button onClick={() => tryEncryption(address, secret)}>
              Encrypt/Decrypt
            </button>
            <div>&nbsp;</div>
            <input
              name="message"
              type="text"
              className="w-32 border border-gray-300 rounded px-1"
              value={secret}
              onChange={handleInputChange}
            />
          </div>
          <div>&nbsp;&nbsp;</div>
          <div>
            {loading && <span>Please wait..</span>}
            {!loading && typeof message === 'string' && (
              <span className="text-green-600 text-nowrap">{message}</span>
            )}
            {encPubkey && (
              <span className="text-nowrap">
                <span>&nbsp;&nbsp;</span>
                <span>[</span>
                <span>
                  <strong>encryption publicKey:</strong>
                </span>
                <span>&nbsp;</span>
                <span className="text-violet-500">
                  {encPubkey.substring(0, 20)}&hellip;
                </span>
                <span>]</span>
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export interface TxnProps {
  address: string | undefined;
}
