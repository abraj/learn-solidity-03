import { useCallback, useState } from 'react';
import { encrypt } from '@metamask/eth-sig-util';

export function useEncryptionDemo() {
  const [message, setMessage] = useState<string | undefined>();
  const [encPubkey, setEncPubkey] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const tryEncryption = useCallback(async (address: string, secret: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ethereum = (window as any).ethereum;

    if (typeof ethereum !== 'undefined') {
      try {
        setLoading(true);
        setMessage(undefined);
        setEncPubkey(undefined);

        const publicKey = await ethereum.request({
          method: 'eth_getEncryptionPublicKey',
          params: [address],
        });
        setEncPubkey(publicKey);

        const encryptedMessage = encrypt({
          publicKey: publicKey,
          data: secret,
          version: 'x25519-xsalsa20-poly1305',
        });

        const decryptedMessage = await ethereum.request({
          method: 'eth_decrypt',
          params: [JSON.stringify(encryptedMessage), address],
        });
        setMessage(decryptedMessage);
      } catch (err) {
        console.error(err);
        setMessage(undefined);
        setEncPubkey(undefined);
      } finally {
        setLoading(false);
      }
    } else {
      console.error('window.ethereum:', ethereum);
    }
  }, []);

  const resetMessage = useCallback(() => {
    setMessage(undefined);
    setEncPubkey(undefined);
  }, []);

  return { message, encPubkey, loading, tryEncryption, resetMessage };
}
