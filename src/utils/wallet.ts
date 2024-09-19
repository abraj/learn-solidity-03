import { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';

function getWalletStatusMsg(status: WalletState['status'], error?: ErrorShape) {
  let message = '';
  if (status === 'connected') {
    message = 'Connected';
  } else if (status === 'error') {
    message = error?.message ?? 'Error!!';
  } else if (status === 'missing') {
    message = 'Please install MetaMask';
  }
  return message;
}

function getWalletState(
  status: WalletState['status'],
  account?: string,
  error?: ErrorShape
): WalletState {
  const message = getWalletStatusMsg(status, error);
  return { status, account, message };
}

function getErrorShape(code: string | number): ErrorShape {
  let message = 'Error!';

  // NOTE: Ethers.js (string error code), Native Metamask (number error code)
  if (code === 'ACTION_REJECTED' || code === 4001) {
    message = 'User rejected the request.';
  }

  return { code: `${code}`, message };
}

export function useConnect() {
  const [status, setStatus] = useState<WalletState>();
  const [loading, setLoading] = useState(false);

  const handleConnect = useCallback(async () => {
    // resets any pre-existing error message
    setStatus(getWalletState('not_connected'));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ethereum = (window as any).ethereum;

    if (typeof ethereum !== 'undefined') {
      try {
        // await ethereum.request({ method: 'wallet_requestPermissions' }, [{ eth_accounts: {} }]);
        // await ethereum.request({ method: 'eth_requestAccounts' });
        // const account = accountsList[0];

        const provider = new ethers.BrowserProvider(ethereum);

        // Prompt the user to approve the `eth_accounts` permission
        // await provider.send('wallet_requestPermissions', [{ eth_accounts: {} }]);

        /**
         * Get ethereum addresses for the "identified" user
         * For "unidentified" users, internally calls `wallet_requestPermissions` for
         * permission to call `eth_accounts`
         */
        const accounts = await provider.send('eth_requestAccounts', []);
        const account = accounts[0];

        // const signer = await provider.getSigner();
        // const account = signer.address;

        setStatus(getWalletState('connected', account));
      } catch (err) {
        console.error(err);
        const error = getErrorShape((err as ErrorShape).code);
        setStatus(getWalletState('error', undefined, error));
      }
    } else {
      setStatus(getWalletState('missing'));
    }
  }, []);

  const checkConnection = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ethereum = (window as any).ethereum;

    if (typeof ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(ethereum);

        const accounts = await provider.listAccounts();

        if (accounts.length > 0) {
          setStatus(getWalletState('connected', accounts[0].address));
        } else {
          setStatus(getWalletState('not_connected'));
        }
      } catch (err) {
        console.error(err);
        const error = getErrorShape((err as ErrorShape).code);
        setStatus(getWalletState('error', undefined, error));
      }
    } else {
      setStatus(getWalletState('missing'));
    }
  }, []);

  const handleDisconnect = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ethereum = (window as any).ethereum;

    if (typeof ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(ethereum);

        await provider.send('wallet_revokePermissions', [{ eth_accounts: {} }]);

        setStatus(getWalletState('not_connected'));
      } catch (err) {
        console.error(err);
        const error = getErrorShape((err as ErrorShape).code);
        setStatus(getWalletState('error', undefined, error));
      }
    } else {
      setStatus(getWalletState('missing'));
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await checkConnection();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { status, loading, handleConnect, handleDisconnect } as {
    status: WalletState;
    loading: boolean;
    handleConnect: () => Promise<void>;
    handleDisconnect: () => Promise<void>;
  };
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

export interface WalletState {
  status: 'missing' | 'connected' | 'error' | 'not_connected' | undefined;
  account?: string;
  message?: string;
}

export interface ErrorShape {
  code: string;
  message: string;
}
