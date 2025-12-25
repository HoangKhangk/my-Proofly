import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConnectButton, useWallet } from '@mysten/wallet-kit';
import type { WalletAccount } from '@mysten/wallet-kit';

interface SuiContextType {
  account: WalletAccount | null;
  isConnected: boolean;
  address: string | null;
  walletName: string | null;
  signAndExecuteTransaction: (transaction: any) => Promise<any>;
}

const SuiContext = createContext<SuiContextType | undefined>(undefined);

export const SuiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const wallet = useWallet();
  const [account, setAccount] = useState<WalletAccount | null>(null);

  useEffect(() => {
    if (wallet.currentAccount) {
      setAccount(wallet.currentAccount);
    }
  }, [wallet.currentAccount]);

  const signAndExecuteTransaction = async (transaction: any) => {
    if (!wallet.currentAccount || !wallet.signAndExecuteTransaction) {
      throw new Error('Wallet chưa kết nối');
    }

    try {
      const result = await wallet.signAndExecuteTransaction({
        transaction: transaction,
      });
      return result;
    } catch (error) {
      console.error('Lỗi thực thi transaction:', error);
      throw error;
    }
  };

  return (
    <SuiContext.Provider
      value={{
        account,
        isConnected: !!account,
        address: account?.address || null,
        walletName: wallet.currentWallet?.name || null,
        signAndExecuteTransaction,
      }}
    >
      {children}
    </SuiContext.Provider>
  );
};

export const useSui = () => {
  const context = useContext(SuiContext);
  if (!context) {
    throw new Error('useSui phải được sử dụng bên trong SuiProvider');
  }
  return context;
};
