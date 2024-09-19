'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import Connect from '@/components/wallet/connect';
import Balance from '@/components/wallet/balance';
import WalletHeader from '@/components/wallet/header';
import type { WalletAccount } from '@/components/wallet/connect';

export default function Page() {
  const [account, setAccount] = useState<WalletAccount>();

  const setWalletAccount = useCallback((value: WalletAccount | undefined) => {
    setAccount(value);
  }, []);

  return (
    <div>
      <WalletHeader chainInfo={account?.chainInfo} />
      <Connect setWalletAccount={setWalletAccount} />
      <Balance address={account?.address} />
      <br />
      <div>
        <Link href="/">Go Home</Link>
      </div>
    </div>
  );
}
