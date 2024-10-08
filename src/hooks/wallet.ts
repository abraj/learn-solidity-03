import { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { addr_includes } from '../utils/address';
import { fetchBalance, sendEth } from '@/api/actions/wallet';
import { displayBalance, weiFromEth } from '@/utils/common';

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
      alias: 'ethereum',
      type: 'mainnet',
    };
  } else if (chainId === '0xaa36a7') {
    return {
      chainId: 11155111,
      chainIdHex: '0xaa36a7',
      name: 'Sepolia Testnet',
      symbol: 'SepoliaETH',
      alias: 'sepolia',
      type: 'testnet',
    };
  } else {
    return {
      chainId: 0,
      chainIdHex: chainId,
      name: 'Unknown Network',
      symbol: 'NO',
      alias: null,
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
  const { status, chainId, account, ensName, error } = obj;
  const message = getWalletStatusMsg(status, error);
  const chainInfo = getChainInfo(chainId);
  return { status, chainInfo, account, ensName, message };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getErrorShape(err: any): ErrorShape {
  let code = '';
  let message = 'Error!';

  if (typeof err?.code === 'string') {
    // Ethers.js error (string code)
    const originalError = err?.info?.error;
    if (originalError?.code && originalError?.message) {
      code = `${originalError.code}`;
      message = originalError.message
        .substring(originalError.message.indexOf(':') + 1)
        .trim();
    } else {
      code = `${err.code}`;
      message = `Error: ${err.shortMessage}`;
    }
  } else {
    // Metamask error (number code)
    if (err?.code && err?.message) {
      code = `${err.code}`;
      message = err.message.substring(err.message.indexOf(':') + 1).trim();
    }
  }

  // NOTE: Ethers.js (string error code), Native Metamask (number error code)
  if (err.code === 'ACTION_REJECTED' || err.code === 4001) {
    message = 'User rejected the request.';
  }

  return { code, message };
}

function getConnectedAccount() {
  return localStorage.getItem('selected_account');
}

function setConnectedAccount(addr: string) {
  // TODO: Verify signature, rather than directly trusting Wallet response
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

        const p1 = provider.getNetwork();
        const p2 = provider.lookupAddress(account);
        const [network, ensName] = await Promise.all([p1, p2]);
        const chainId = `0x${network.chainId.toString(16)}`;
        setStatus(getWalletState({ status, chainId, account, ensName }));
      } catch (err) {
        console.error(err);
        const error = getErrorShape(err);
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
        const error = getErrorShape(err);
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

        const accountsRpc = await provider.listAccounts();
        const accounts = accountsRpc.map((v) => v.address);

        let account = getConnectedAccount() ?? undefined;
        if (accounts.length && !account) {
          setConnectedAccount(accounts[0]);
          account = getConnectedAccount() ?? undefined;
        }

        if (!accounts || accounts.length === 0) {
          await handleDisconnect();
        } else if (!addr_includes(accounts, account)) {
          await handleDisconnect();
        } else {
          const status = 'connected';
          setStatus(getWalletState({ status, account }));

          const p1 = provider.getNetwork();
          const p2 = provider.lookupAddress(account!);
          const [network, ensName] = await Promise.all([p1, p2]);
          const chainId = `0x${network.chainId.toString(16)}`;
          setStatus(getWalletState({ status, chainId, account, ensName }));
        }
      } catch (err) {
        console.error(err);
        const error = getErrorShape(err);
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
        const error = getErrorShape(err);
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
        const ethBalance = displayBalance(balance);
        setBalance(ethBalance);
      } catch (err) {
        console.error(err);
        setBalance(undefined);
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

  const getBalanceFromServer = useCallback(
    async (address: string | undefined, chainId: number | undefined) => {
      try {
        if (address) {
          setLoading(true);
          const resp = await fetchBalance(chainId, address);
          setLoading(false);
          if (resp.status === 'ok') {
            setBalance(resp.balance);
          } else {
            console.error(resp);
            throw new Error(resp.errMsg);
          }
        }
      } catch (err) {
        console.error(err);
        setBalance(undefined);
      }
    },
    []
  );

  const resetBalance = useCallback(() => {
    setBalance(undefined);
  }, []);

  return {
    balance,
    loading,
    getBalance,
    getBalanceFromServer,
    resetBalance,
  } as UseBalanceReturn;
}

export function useTxn() {
  const [hash, setHash] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const submitTxn = useCallback(
    async (
      address: string | undefined,
      toAddress: string | undefined,
      ethAmount: number | undefined
    ) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ethereum = (window as any).ethereum;

      const weiValue = weiFromEth(ethAmount);
      const toAddressValid = ethers.isAddress(toAddress);

      if (
        typeof ethereum !== 'undefined' &&
        address &&
        toAddressValid &&
        weiValue
      ) {
        try {
          const provider = new ethers.BrowserProvider(ethereum);
          const signer = await provider.getSigner();

          const txParams = {
            to: toAddress,
            value: weiValue,
            // gasLimit: 21000,
          };
          setLoading(true);
          const tx = await signer.sendTransaction(txParams);
          setHash(tx.hash);
        } catch (err) {
          console.error(err);
          setHash(undefined);
        } finally {
          setLoading(false);
        }
      } else {
        if (!address) {
          console.error('Missing address:', address);
        } else if (!toAddressValid) {
          console.error('Invalid toAddress:', toAddress);
        } else if (!weiValue) {
          console.error('Invalid Amount:', ethAmount);
        } else {
          console.error('window.ethereum:', ethereum);
        }
      }
    },
    []
  );

  const submitTxnFromServer = useCallback(
    async (
      chainId: number | undefined,
      address: string | undefined,
      toAddress: string | undefined,
      ethAmount: number | undefined
    ) => {
      try {
        if (address) {
          setLoading(true);
          const resp = await sendEth(chainId, address, toAddress, ethAmount);
          setLoading(false);
          if (resp.status === 'ok') {
            setHash(resp.hash);
          } else {
            console.error(resp);
            throw new Error(resp.errMsg);
          }
        }
      } catch (err) {
        console.error(err);
        setHash(undefined);
      }
    },
    []
  );

  const submitForm = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const form = e.target as HTMLFormElement;
      const submitter = (
        form.elements.namedItem('submitter') as HTMLInputElement
      ).value;
      const address = (form.elements.namedItem('address') as HTMLInputElement)
        .value;
      const chainId = (form.elements.namedItem('chainId') as HTMLInputElement)
        .value;
      const amount = (form.elements.namedItem('amount') as HTMLInputElement)
        .value;
      const toAddress = (
        form.elements.namedItem('toAddress') as HTMLInputElement
      ).value;

      if (submitter === 'button1') {
        submitTxn(address, toAddress, Number(amount));
      } else if (submitter === 'button2') {
        submitTxnFromServer(
          Number(chainId),
          address,
          toAddress,
          Number(amount)
        );
      } else {
        console.error('Invalid submitter!');
      }
    },
    [submitTxn, submitTxnFromServer]
  );

  const resetHash = useCallback(() => {
    setHash(undefined);
  }, []);

  return {
    hash,
    loading,
    submitForm,
    resetHash,
  } as UseHashReturn;
}

interface UseBalanceReturn {
  balance: number | undefined;
  loading: boolean;
  getBalance: (address: string | undefined) => Promise<void>;
  getBalanceFromServer: (
    address: string | undefined,
    chainId: number | undefined
  ) => Promise<void>;
  resetBalance: () => void;
}

interface UseHashReturn {
  hash: string | undefined;
  loading: boolean;
  submitForm: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  resetHash: () => void;
}

export interface WalletState {
  status: 'missing' | 'connected' | 'error' | 'not_connected' | undefined;
  chainInfo?: ChainInfo;
  account?: string;
  ensName?: string | null;
  message?: string;
}

interface WalletStateArg {
  status: WalletState['status'];
  chainId?: string;
  account?: string;
  ensName?: string | null;
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
  alias: string | null;
  type: 'mainnet' | 'testnet' | 'local' | 'unknown';
}
