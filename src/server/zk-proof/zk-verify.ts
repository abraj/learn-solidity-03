import { ethers } from 'ethers';
import {
  getPrivateKeyServerOnly,
  getRpcUrlServerOnly,
} from '@/server/utils/server-utils';
import { contractAddress, abi } from '@/utils/const/zk-sepolia';

export async function submitZKProofOnChain({
  callData,
}: VerifyProofArgs): Promise<[boolean, string]> {
  const chainId = 11155111; // sepolia
  const address = process.env.WALLET_ADDRESS;

  const rpcUrl = getRpcUrlServerOnly(chainId);
  const privateKey = getPrivateKeyServerOnly(address);
  if (rpcUrl && privateKey) {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);

      // const signer = new ethers.Wallet(privateKey).connect(provider);
      const signer = new ethers.Wallet(privateKey, provider);

      const contract = new ethers.Contract(contractAddress, abi, signer);
      const verified: boolean = await contract.verifyProof(...callData);

      return [verified, ''];
    } catch (err) {
      console.error(err);
      return [false, 'Something went wrong!'];
    }
  } else {
    if (!privateKey) {
      console.error('[ERROR] Account not connected (on server):', address);
      return [false, 'Invalid Account'];
    } else {
      console.error('[ERROR] Invalid Network! rpcUrl:', rpcUrl);
      return [false, 'Invalid Network'];
    }
  }
}

interface VerifyProofArgs {
  callData: [
    [bigint, bigint],
    [[bigint, bigint], [bigint, bigint]],
    [bigint, bigint],
    [bigint],
  ];
}
