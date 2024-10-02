export function getRpcUrlServerOnly(chainId: number | undefined) {
  if (chainId === 1) {
    return process.env.MAINNET_RPC_URL;
  } else if (chainId === 11155111) {
    return process.env.SEPOLIA_RPC_URL;
  } else {
    return null;
  }
}

export function getPrivateKeyServerOnly(addr: string | undefined) {
  if (!addr) return null;
  const address = addr.toLowerCase();
  if (address === process.env.WALLET_ADDRESS) {
    return process.env.WALLET_PRIVATE_KEY;
  } else {
    return null;
  }
}
