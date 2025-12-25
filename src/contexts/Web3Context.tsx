import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface Web3ContextType {
  account: string | null;
  isConnected: boolean;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  signMessage: (message: string) => Promise<string>;
  contractAddress: string;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  // Smart Contract Address (Sepolia Testnet)
  const contractAddress = '0x1234567890123456789012345678901234567890'; // Replace với address thực tế

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask không được cài đặt. Vui lòng cài đặt MetaMask!');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      const ethersSigner = await ethersProvider.getSigner();

      setProvider(ethersProvider);
      setSigner(ethersSigner);
      setAccount(accounts[0]);
    } catch (error) {
      console.error('Lỗi kết nối wallet:', error);
      throw error;
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
  };

  const signMessage = async (message: string): Promise<string> => {
    if (!signer) {
      throw new Error('Wallet chưa kết nối');
    }
    const signature = await signer.signMessage(message);
    return signature;
  };

  // Check nếu wallet đã kết nối trước đó
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          });
          if (accounts.length > 0) {
            const ethersProvider = new ethers.BrowserProvider(window.ethereum);
            const ethersSigner = await ethersProvider.getSigner();
            setProvider(ethersProvider);
            setSigner(ethersSigner);
            setAccount(accounts[0]);
          }
        } catch (error) {
          console.error('Lỗi kiểm tra kết nối:', error);
        }
      }
    };

    checkConnection();
  }, []);

  return (
    <Web3Context.Provider
      value={{
        account,
        isConnected: !!account,
        provider,
        signer,
        connectWallet,
        disconnectWallet,
        signMessage,
        contractAddress,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 phải được sử dụng bên trong Web3Provider');
  }
  return context;
};
