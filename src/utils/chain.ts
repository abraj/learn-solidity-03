import { ethers } from 'ethers';

export async function switchChain() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ethereum = (window as any).ethereum;

  if (typeof ethereum !== 'undefined') {
    try {
      const provider = new ethers.BrowserProvider(ethereum);
      await provider.send('wallet_switchEthereumChain', [{ chainId: '0x1' }]);
    } catch (err) {
      console.error(err);
    }
  } else {
    console.error('window.ethereum:', ethereum);
  }
}
