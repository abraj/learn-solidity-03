'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import Connect from '@/components/wallet/connect';
import Balance from '@/components/wallet/balance';
import WalletHeader from '@/components/wallet/header';
import FundFundMe from '@/components/wallet/fundme-fund';
import WithdrawFundMe from '@/components/wallet/fundme-withdraw';
import type { WalletAccount } from '@/components/wallet/connect';
// import { contractAddress } from '@/const/sepolia';

export default function Page() {
  const [account, setAccount] = useState<WalletAccount>();

  const setWalletAccount = useCallback((value: WalletAccount | undefined) => {
    setAccount(value);
  }, []);

  const address = account?.address;
  return (
    <div>
      <WalletHeader chainInfo={account?.chainInfo} />
      <Connect setWalletAccount={setWalletAccount} />

      <Balance address={address} />
      {/* <Balance address={contractAddress} /> */}

      <FundFundMe visible={!!address} />
      <WithdrawFundMe visible={!!address} />
      <br />
      <div>
        <Link href="/">Go Home</Link>
      </div>
    </div>
  );
}
