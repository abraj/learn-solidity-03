'use server';

import { ethers } from 'ethers';
import { getPrivateKey, getRpcUrl } from '@/api/utils/network';
import { displayBalance, weiFromEth } from '@/utils/common';

export async function fetchBalance(
  chainId: number | undefined,
  address: string
): Promise<ActionResponse & { balance?: number }> {
  const rpcUrl = getRpcUrl(chainId);
  if (rpcUrl) {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const balance = await provider.getBalance(address);
      const ethBalance = displayBalance(balance);
      return { status: 'ok', balance: ethBalance };
    } catch (err) {
      console.error(err);
      return { status: 'error', errMsg: 'Something went wrong!' };
    }
  } else {
    console.error('[ERROR] Invalid Network! rpcUrl:', rpcUrl);
    return { status: 'error', errMsg: 'Invalid Network' };
  }
}

// EIP-1559 txn
export async function sendEth(
  chainId: number | undefined,
  address: string | undefined,
  toAddress: string | undefined,
  ethAmount: number | undefined
): Promise<ActionResponse & { hash?: string }> {
  const rpcUrl = getRpcUrl(chainId);
  const privateKey = getPrivateKey(address);
  const weiValue = weiFromEth(ethAmount);
  const toAddressValid = ethers.isAddress(toAddress);
  if (rpcUrl && privateKey && weiValue && toAddressValid) {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);

      // const signer = new ethers.Wallet(privateKey).connect(provider);
      const signer = new ethers.Wallet(privateKey, provider);

      const txParams = {
        to: toAddress,
        value: weiValue,
        // gasLimit: 21000,
        // gasPrice: await provider.getGasPrice(), // Optional, provider will use default if not specified
      };
      const tx = await signer.sendTransaction(txParams);
      return { status: 'ok', hash: tx.hash };
    } catch (err) {
      console.error(err);
      return { status: 'error', errMsg: 'Something went wrong!' };
    }
  } else {
    if (!privateKey) {
      console.error('[ERROR] Account not connected (on server):', address);
      return { status: 'error', errMsg: 'Invalid Account' };
    } else if (!weiValue) {
      console.error('[ERROR] Invalid Amount:', ethAmount, weiValue);
      return { status: 'error', errMsg: 'Invalid Amount' };
    } else if (!toAddressValid) {
      console.error('[ERROR] Invalid toAddress:', toAddress, toAddressValid);
      return { status: 'error', errMsg: 'Invalid toAddress' };
    } else {
      console.error('[ERROR] Invalid Network! rpcUrl:', rpcUrl);
      return { status: 'error', errMsg: 'Invalid Network' };
    }
  }
}

interface ActionResponse {
  status: 'ok' | 'error';
  errMsg?: string;
}
