import React, { createContext, useContext, useState, useEffect } from 'react';
import { getWallets } from '@mysten/wallet-standard';

interface SuiWalletContextType {
  account: string | null;
  isConnected: boolean;
  isLoading: boolean;
  connect: () => Promise<string>;
  disconnect: () => void;
}

const SuiWalletContext = createContext<SuiWalletContextType | undefined>(undefined);

export const SuiWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get Sui Wallet using wallet-standard (Wallet Standard way)
  const getSuiWallet = async (): Promise<any> => {
    console.log('=== Getting Sui Wallet ===');
    
    // Check old way first (window.sui / window.suiWallet)
    console.log('Checking window.sui:', typeof window.sui);
    console.log('Checking window.suiWallet:', typeof window.suiWallet);
    
    if (window.sui && typeof window.sui !== 'undefined') {
      console.log('✓ Found window.sui (old way)');
      return window.sui;
    }
    
    if (window.suiWallet && typeof window.suiWallet !== 'undefined') {
      console.log('✓ Found window.suiWallet (old way)');
      return window.suiWallet;
    }
    
    // New way: Use wallet-standard (Slush / Suiet / Martian / Sui Wallet)
    console.log('Wallets not injected, trying wallet-standard...');
    
    // Wait for wallets to register
    let wallets = getWallets().get();
    let attempts = 0;
    
    while ((!wallets || wallets.length === 0) && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 100));
      wallets = getWallets().get();
      attempts++;
    }
    
    console.log(`Got ${wallets?.length || 0} wallets after ${attempts} attempts`);
    if (wallets && wallets.length > 0) {
      console.log('Available wallets:', wallets.map(w => w.name));
    }
    
    // Find Sui Wallet
    const suiWallet = wallets?.find(w => w.name === 'Sui Wallet');
    
    if (!suiWallet) {
      throw new Error(
        'Sui Wallet extension not found. Please:\n' +
        '1. Install Sui Wallet extension từ Chrome Web Store\n' +
        '2. Mở extension và unlock ví bằng password\n' +
        '3. Refresh trang (F5 hoặc Ctrl+R)\n' +
        '4. Click "Kết Nối Sui Wallet" lại'
      );
    }
    
    console.log('✓ Found Sui Wallet:', suiWallet.name);
    return suiWallet;
  };

  // Connect to wallet using standard:connect feature
  const connect = async (): Promise<string> => {
    setIsLoading(true);
    try {
      console.log('Starting connection...');
      const wallet = await getSuiWallet();
      
      // Check if wallet has standard:connect feature
      if (!wallet.features || !wallet.features['standard:connect']) {
        console.error('Wallet features:', wallet.features ? Object.keys(wallet.features) : 'none');
        throw new Error('Wallet does not support standard:connect');
      }
      
      console.log('Calling connect()...');
      const result = await wallet.features['standard:connect'].connect();
      console.log('✓ Connect result:', result);
      
      // Get address from accounts
      if (!result.accounts || result.accounts.length === 0) {
        throw new Error('No accounts returned from wallet');
      }
      
      const address = result.accounts[0].address;
      console.log('✓✓✓ Successfully connected! Address:', address);
      
      setAccount(address);
      localStorage.setItem('sui_wallet_address', address);
      return address;
    } catch (error: any) {
      console.error('✗ Connection failed:', error?.message || error);
      throw new Error(error?.message || 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect from wallet
  const disconnect = () => {
    setAccount(null);
    localStorage.removeItem('sui_wallet_address');
  };

  // Check if wallet was connected before
  useEffect(() => {
    const savedAddress = localStorage.getItem('sui_wallet_address');
    if (savedAddress) {
      setAccount(savedAddress);
    }
  }, []);

  return (
    <SuiWalletContext.Provider
      value={{
        account,
        isConnected: !!account,
        isLoading,
        connect,
        disconnect,
      }}
    >
      {children}
    </SuiWalletContext.Provider>
  );
};

export const useSuiWallet = () => {
  const context = useContext(SuiWalletContext);
  if (!context) {
    throw new Error('useSuiWallet must be used within SuiWalletProvider');
  }
  return context;
};
