import { ethers, SigningKey } from 'ethers';
import { useCallback, useState } from 'react';
import { getPublicKey } from '@/api/actions/txns';
import { sample_sign } from '@/store/store';

export function usePubkey() {
  const [pubkey, setPubkey] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const getPubkey = useCallback(async (address: string | undefined) => {
    setLoading(true);
    setPubkey(undefined);

    const sampleSign = sample_sign.value;
    if (sampleSign) {
      const siweMessage = sampleSign.message;
      const sign = sampleSign.signature;
      const messageHash = ethers.hashMessage(siweMessage);
      const publicKey1 = SigningKey.recoverPublicKey(messageHash, sign);

      const address1 = ethers.computeAddress(publicKey1);
      if (address && address.toLowerCase() === address1.toLowerCase()) {
        setPubkey(publicKey1);
      } else {
        console.error('Invalid publicKey computed!');
      }
    } else {
      console.error(
        'No sample sign exists! Please sign-in with Ethereum first.'
      );
    }

    setLoading(false);
  }, []);

  const getPubkeyFromServer = useCallback(
    async (address: string | undefined, chainId: number | undefined) => {
      if (address && chainId) {
        try {
          setLoading(true);
          const pubKey = await getPublicKey(address, chainId);
          setPubkey(pubKey);
        } catch (err) {
          console.error(err);
          setPubkey(undefined);
        } finally {
          setLoading(false);
        }
      } else {
        console.error('Invalid args:', address, chainId);
      }
    },
    []
  );

  const resetPubkey = useCallback(() => {
    setPubkey(undefined);
  }, []);

  return { pubkey, loading, getPubkey, getPubkeyFromServer, resetPubkey };
}
