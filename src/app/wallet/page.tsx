'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import Connect from '@/components/wallet/connect';
import Balance from '@/components/wallet/balance';

export default function Page() {
  const [address, setAddress] = useState<string>();

  const setAccount = useCallback((v: string | undefined) => {
    setAddress(v);
  }, []);

  return (
    <div>
      <Connect setAccount={setAccount} />
      <Balance address={address} />
      <br />
      <div>
        <Link href="/">Go Home</Link>
      </div>
    </div>
  );
}
