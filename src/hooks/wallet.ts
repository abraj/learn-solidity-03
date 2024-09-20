import { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { addr_includes } from '../utils/address';

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

function getChainInfo(chainId: string | undefined): ChainInfo | undefined {
  if (!chainId) return undefined;
  if (chainId === '0x1') {
    return {
      chainId: 1,
      chainIdHex: '0x1',
      name: 'Ethereum Mainnet',
      symbol: 'ETH',
      type: 'mainnet',
    };
  } else if (chainId === '0xaa36a7') {
    return {
      chainId: 11155111,
      chainIdHex: '0xaa36a7',
      name: 'Sepolia Testnet',
      symbol: 'SepoliaETH',
      type: 'testnet',
    };
  } else {
    return {
      chainId: 0,
      chainIdHex: chainId,
      name: 'Unknown Network',
      symbol: 'NO',
      type: 'unknown',
    };
  }
}

function getWalletState(argx: string | WalletStateArg): WalletState {
  let obj: WalletStateArg;
  if (typeof argx === 'string') {
    obj = { status: argx as WalletStateArg['status'] };
  } else {
    obj = argx;
  }
  const { status, chainId, account, error } = obj;
  const message = getWalletStatusMsg(status, error);
  const chainInfo = getChainInfo(chainId);
  return { status, chainInfo, account, message };
}

function getErrorShape(code: string | number): ErrorShape {
  let message = 'Error!';

  // NOTE: Ethers.js (string error code), Native Metamask (number error code)
  if (code === 'ACTION_REJECTED' || code === 4001) {
    message = 'User rejected the request.';
  }

  return { code: `${code}`, message };
}

function getConnectedAccount() {
  return localStorage.getItem('selected_account');
}

function setConnectedAccount(addr: string) {
  localStorage.setItem('selected_account', addr);
}

function removeConnectedAccount() {
  return localStorage.removeItem('selected_account');
}

export function useConnect() {
  const [status, setStatus] = useState<WalletState | undefined>();
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
        const account = accounts[0]; // Use selected account, by default (for now)

        // const signer = await provider.getSigner();
        // const account = signer.address;

        const status = 'connected';
        setConnectedAccount(account);
        setStatus(getWalletState({ status, account }));

        // NOTE: intentionally not `await`ed
        provider.getNetwork().then((network) => {
          const chainId = `0x${network.chainId.toString(16)}`;
          setStatus(getWalletState({ status, chainId, account }));
        });
      } catch (err) {
        console.error(err);
        const error = getErrorShape((err as ErrorShape).code);
        setStatus(getWalletState({ status: 'error', error }));
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
        const account = getConnectedAccount() ?? undefined;
        if (account) {
          const provider = new ethers.BrowserProvider(ethereum);
          await provider.send('wallet_revokePermissions', [
            { eth_accounts: {} },
          ]);
          removeConnectedAccount();
        }
        setStatus(getWalletState('not_connected'));
      } catch (err) {
        console.error(err);
        const error = getErrorShape((err as ErrorShape).code);
        setStatus(getWalletState({ status: 'error', error }));
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

        const p1 = provider.listAccounts();
        const p2 = provider.getNetwork();
        const [accountsRpc, network] = await Promise.all([p1, p2]);
        const chainId = `0x${network.chainId.toString(16)}`;

        const accounts = accountsRpc.map((v) => v.address);
        const account = getConnectedAccount() ?? undefined;

        if (!accounts || accounts.length === 0) {
          await handleDisconnect();
        } else if (!addr_includes(accounts, account)) {
          await handleDisconnect();
        } else {
          setStatus(getWalletState({ status: 'connected', chainId, account }));
        }
      } catch (err) {
        console.error(err);
        const error = getErrorShape((err as ErrorShape).code);
        setStatus(getWalletState({ status: 'error', error }));
      }
    } else {
      setStatus(getWalletState('missing'));
    }
  }, [handleDisconnect]);

  const handleAccountsChanged = useCallback(
    async (accounts: string[]) => {
      if (status?.status === 'connected') {
        if (!accounts || accounts.length === 0) {
          await handleDisconnect();
        } else if (!addr_includes(accounts, status.account)) {
          await handleDisconnect();
        }
      }
    },
    [status, handleDisconnect]
  );

  const updateWalletAndAccounts = useCallback(
    (chainId: string) => {
      if (status?.status === 'connected' && chainId) {
        // Rather, reload (as suggested by Metamask docs)
        // Ref: https://docs.metamask.io/wallet/reference/provider-api/#chainchanged
        window.location.reload();
      }
    },
    [status]
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      await checkConnection();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ethereum = (window as any).ethereum;

    if (typeof ethereum !== 'undefined') {
      try {
        // const provider = new ethers.BrowserProvider(ethereum);
        ethereum.on('accountsChanged', handleAccountsChanged);
        ethereum.on('chainChanged', updateWalletAndAccounts);
        return () => {
          ethereum.removeListener('accountsChanged', handleAccountsChanged);
          ethereum.removeListener('chainChanged', updateWalletAndAccounts);
        };
      } catch (err) {
        console.error(err);
        const error = getErrorShape((err as ErrorShape).code);
        setStatus(getWalletState({ status: 'error', error }));
      }
    }
  }, [handleAccountsChanged, updateWalletAndAccounts]);

  return { status, loading, handleConnect, handleDisconnect } as {
    status: WalletState | undefined;
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

  const resetBalance = useCallback(() => {
    setBalance(undefined);
  }, []);

  return { balance, loading, getBalance, resetBalance } as UseBalanceReturn;
}

interface UseBalanceReturn {
  balance: number | undefined;
  loading: boolean;
  getBalance: (address: string | undefined) => Promise<void>;
  resetBalance: () => void;
}

export interface WalletState {
  status: 'missing' | 'connected' | 'error' | 'not_connected' | undefined;
  chainInfo?: ChainInfo;
  account?: string;
  message?: string;
}

interface WalletStateArg {
  status: WalletState['status'];
  chainId?: string;
  account?: string;
  error?: ErrorShape;
}

export interface ErrorShape {
  code: string;
  message: string;
}

export interface ChainInfo {
  chainId: number;
  chainIdHex: string;
  name: string;
  symbol: string;
  type: 'mainnet' | 'testnet' | 'local' | 'unknown';
}
