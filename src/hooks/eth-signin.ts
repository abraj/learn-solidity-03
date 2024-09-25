import { useCallback, useState } from 'react';
import { ethers } from 'ethers';

export const useEthSignIn = () => {
  const [sign, setSign] = useState<string | undefined>();
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const startEthSignIn = useCallback(async (address: string | undefined) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ethereum = (window as any).ethereum;

    if (typeof ethereum !== 'undefined' && address) {
      try {
        const provider = new ethers.BrowserProvider(ethereum);

        const domain = window.location.host;
        const from = address;
        const siweMessage = `${domain} wants you to sign in with your Ethereum account:\n${from}\n\nI accept the MetaMask Terms of Service: https://community.metamask.io/tos\n\nURI: https://${domain}\nVersion: 1\nChain ID: 1\nNonce: 32891757\nIssued At: 2021-09-30T16:25:24.000Z`;
        const msg = `0x${Buffer.from(siweMessage, 'utf8').toString('hex')}`;

        setLoading(true);
        setSign(undefined);
        setVerified(false);

        const sign = await provider.send('personal_sign', [msg, from]);
        // const sign = await ethereum.request({ method: 'personal_sign', params: [msg, from] });
        setSign(sign);

        const recoveredAddress = ethers.verifyMessage(siweMessage, sign);
        const isVerified =
          recoveredAddress.toLowerCase() === address.toLowerCase();
        setVerified(isVerified);
      } catch (err) {
        console.error(err);
        setSign(undefined);
        setVerified(false);
      } finally {
        setLoading(false);
      }
    } else {
      if (!address) {
        console.error('Missing address:', address);
      } else {
        console.error('window.ethereum:', ethereum);
      }
    }
  }, []);

  const resetEthSignIn = useCallback(() => {
    setSign(undefined);
    setVerified(false);
  }, []);

  return { sign, verified, loading, startEthSignIn, resetEthSignIn };
};
