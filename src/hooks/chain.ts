import { useCallback, useEffect, useRef, useState } from 'react';
import { ethers } from 'ethers';
import { contractAddress, abi } from '@/const/sepolia';
import { getErrorShape } from './wallet';

export function useFundFundMe() {
  const [response, setResponse] = useState<ChainResponse>();
  const [loading, setLoading] = useState(false);

  const [confirming, setConfirming] = useState(false);
  const confPr = useRef<Promise<unknown> | null>(null);

  const fundFundMe = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const form = e.target as HTMLFormElement;
      const ethAmount = (form.elements.namedItem('amount') as HTMLInputElement)
        .value;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ethereum = (window as any).ethereum;

      if (typeof ethereum !== 'undefined') {
        try {
          const provider = new ethers.BrowserProvider(ethereum);
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(contractAddress, abi, signer);

          setLoading(true);
          const txnResponse = await contract.fund({
            value: ethers.parseEther(ethAmount),
          });
          setResponse({ status: 'ok', message: 'Confirming..' });

          confPr.current = txnResponse.wait(1);
          setConfirming(true);
        } catch (err) {
          console.error(err);
          const error = getErrorShape(err);
          setResponse({ status: 'error', message: error.message });
        } finally {
          setLoading(false);
        }
      } else {
        setResponse({ status: 'error', message: 'Please install Metamask!' });
      }
    },
    []
  );

  useEffect(() => {
    if (!confirming) return;
    (async () => {
      try {
        if (confPr.current) {
          await confPr.current;
          confPr.current = null;
        }
        setResponse({ status: 'ok', message: 'Success' });
      } catch (err) {
        console.error(err);
        const error = getErrorShape(err);
        setResponse({ status: 'error', message: error.message });
      } finally {
        setConfirming(false);
      }
    })();
  }, [confirming]);

  return { response, loading, fundFundMe };
}

export function useWithdrawFundMe() {
  const [response, setResponse] = useState<ChainResponse>();
  const [loading, setLoading] = useState(false);

  const [confirming, setConfirming] = useState(false);
  const confPr = useRef<Promise<unknown> | null>(null);

  const withdrawFundMe = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ethereum = (window as any).ethereum;

    if (typeof ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);

        setLoading(true);
        const txnResponse = await contract.withdraw();
        setResponse({ status: 'ok', message: 'Confirming..' });

        confPr.current = txnResponse.wait(1);
        setConfirming(true);
      } catch (err) {
        console.error(err);
        const error = getErrorShape(err);
        setResponse({ status: 'error', message: error.message });
      } finally {
        setLoading(false);
      }
    } else {
      setResponse({ status: 'error', message: 'Please install Metamask!' });
    }
  }, []);

  useEffect(() => {
    if (!confirming) return;
    (async () => {
      try {
        if (confPr.current) {
          await confPr.current;
          confPr.current = null;
        }
        setResponse({ status: 'ok', message: 'Success' });
      } catch (err) {
        console.error(err);
        const error = getErrorShape(err);
        setResponse({ status: 'error', message: error.message });
      } finally {
        setConfirming(false);
      }
    })();
  }, [confirming]);

  return { response, loading, withdrawFundMe };
}

interface ChainResponse {
  status: 'ok' | 'error';
  message: string;
}
