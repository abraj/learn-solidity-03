'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import Connect from '@/components/wallet/connect';
import EthSignIn from '@/components/wallet/eth-signin';
import Balance from '@/components/wallet/balance';
import WalletHeader from '@/components/wallet/header';
import FundFundMe from '@/components/wallet/fundme-fund';
import WithdrawFundMe from '@/components/wallet/fundme-withdraw';
import SendTxn from '@/components/wallet/send-txn';
import Pubkey from '@/components/wallet/public-key';
import EncryptionDemo from '@/components/wallet/encryption';
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
      <EthSignIn address={address} />
      <Pubkey address={address} chainInfo={account?.chainInfo} />
      <EncryptionDemo address={address} />

      <Balance address={address} chainInfo={account?.chainInfo} />
      {/* <Balance address={contractAddress} /> */}
      <SendTxn address={address} chainInfo={account?.chainInfo} />

      <FundFundMe visible={!!address} />
      <WithdrawFundMe visible={!!address} />
      <br />
      <div>
        <Link href="/">Go Home</Link>
      </div>
    </div>
  );
}
