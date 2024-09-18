import { useCallback, useState } from 'react';
import { ethers } from 'ethers';

export type WalletStatus = 'missing' | 'connected' | 'error' | undefined;

function getWalletStatusMsg(status: WalletStatus) {
  let msg = '';
  if (status === 'connected') {
    msg = 'Connected';
  } else if (status === 'error') {
    msg = 'Error!';
  } else if (status === 'missing') {
    msg = 'Please install MetaMask';
  }
  return msg;
}

export function useConnect() {
  const [status, setStatus] = useState<WalletStatus>();
  const [account, setAccount] = useState<string>();

  const handleConnect = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ethereum = (window as any).ethereum;

    if (typeof ethereum !== 'undefined') {
      try {
        await ethereum.request({ method: 'eth_requestAccounts' });
        const accountsList = await ethereum.request({ method: 'eth_accounts' });
        if (accountsList < 1) {
          throw new Error('Empty accountsList!');
        }
        setStatus('connected');
        setAccount(accountsList[0]);
      } catch (err) {
        console.error(err);
        setStatus('error');
      }
    } else {
      setStatus('missing');
    }
  }, []);

  const msg = getWalletStatusMsg(status);

  return [status, msg, account, handleConnect] as [
    WalletStatus,
    string,
    string | undefined,
    () => Promise<void>,
  ];
}

export function useBalance() {
  const [balance, setBalance] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);

  const getBalance = useCallback(async (address: string | undefined) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ethereum = (window as any).ethereum;

    if (typeof ethereum !== 'undefined' && address) {
      try {
        const provider = new ethers.BrowserProvider(ethereum);
        setLoading(true);
        const balance = await provider.getBalance(address);
        setLoading(false);
        const ethBalanceStr = ethers.formatEther(balance);
        let ethBalance = Number.parseFloat(ethBalanceStr);
        ethBalance = Math.round(ethBalance * 10 ** 4) / 10 ** 4;
        setBalance(ethBalance);
      } catch (err) {
        console.error(err);
        setBalance(undefined);
      }
    } else {
      if (!address) {
        console.error('Missing address:', address);
      } else {
        console.error('window.ethereum:', ethereum);
      }
    }
  }, []);

  return [balance, loading, getBalance] as [
    number | undefined,
    boolean,
    (address: string | undefined) => Promise<void>,
  ];
}
