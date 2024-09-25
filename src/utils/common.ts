import { formatEther, parseUnits } from 'ethers';

export const displayBalance = (wei: bigint) => {
  const ethBalanceStr = formatEther(wei);
  let ethBalance = Number.parseFloat(ethBalanceStr);
  ethBalance = Math.round(ethBalance * 10 ** 4) / 10 ** 4;
  return ethBalance;
};

export const weiFromEth = (eth: number | undefined) => {
  if (typeof eth === 'number' && eth > 0) {
    return parseUnits(`${eth}`, 'ether');
  } else {
    return null;
  }
};
