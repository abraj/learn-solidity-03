'use server';

import { ethers, SigningKey } from 'ethers';
import { getRpcUrl } from '../utils/network';

async function getFirstSentTxn(
  address: string | undefined,
  chainId: number | undefined
) {
  if (!address) {
    throw new Error(`Invalid address: ${address}`);
  }
  if (!chainId) {
    throw new Error(`Invalid chainId: ${chainId}`);
  }

  const rpcUrl = getRpcUrl(chainId);
  if (!rpcUrl || !rpcUrl.includes('alchemy')) {
    throw new Error(`Invalid archemy rpcUrl: ${rpcUrl}`);
  }

  const data = JSON.stringify({
    jsonrpc: '2.0',
    id: 0,
    method: 'alchemy_getAssetTransfers',
    params: [
      {
        fromBlock: '0x0',
        fromAddress: address,
        // category: ['external', 'internal', 'erc20', 'erc721', 'erc1155'],
        category: ['external'],
      },
    ],
  });

  const fetchURL = `${rpcUrl}`;
  const resp = await fetch(fetchURL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data,
    redirect: 'follow',
  });
  const respData = await resp.json();

  const transfers = respData?.result?.transfers;
  if (!transfers) {
    throw new Error('Error getting txn!');
  }
  if (!transfers.length) {
    throw new Error('No txns sent by this address yet!');
  }

  const txn = transfers[0];
  return txn.hash;
}

async function getTxnData(hash: string, chainId: number | undefined) {
  const rpcUrl = getRpcUrl(chainId);
  if (!rpcUrl) {
    throw new Error('Invalid rpcUrl');
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl!);
  const tx = await provider.getTransaction(hash);
  if (!tx) {
    throw new Error(`Unable to get txn for hash: ${hash}`);
  }
  return tx;
}

export async function getPublicKey(
  address: string | undefined,
  chainId: number | undefined
) {
  const hash = await getFirstSentTxn(address, chainId);
  const tx = await getTxnData(hash, chainId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let unsignedTx: any;
  switch (tx.type) {
    case 0:
      unsignedTx = {
        gasPrice: tx.gasPrice,
        gasLimit: tx.gasLimit,
        value: tx.value,
        nonce: tx.nonce,
        data: tx.data,
        chainId: tx.chainId,
        to: tx.to,
      };
      break;
    case 2:
      unsignedTx = {
        gasLimit: tx.gasLimit,
        value: tx.value,
        nonce: tx.nonce,
        data: tx.data,
        chainId: tx.chainId,
        to: tx.to,
        type: 2,
        maxFeePerGas: tx.maxFeePerGas,
        maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
      };
      break;
    default:
      throw 'Unsupported tx type';
  }

  const signature = {
    r: tx.signature.r,
    s: tx.signature.s,
    v: tx.signature.v,
  };

  unsignedTx = await ethers.resolveProperties(unsignedTx); // create copy
  const serializedTx = ethers.Transaction.from(unsignedTx); // serialize without signature
  const txHashBytes = serializedTx.unsignedHash; // get the hash of the transaction
  const publicKey = SigningKey.recoverPublicKey(txHashBytes, signature);

  const address1 = ethers.computeAddress(publicKey);
  if (address?.toLowerCase() !== address1.toLowerCase()) {
    throw new Error('Invalid publicKey computed!');
  }

  return publicKey;
}
