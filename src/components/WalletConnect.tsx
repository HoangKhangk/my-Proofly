import React, { useState } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export const WalletConnect: React.FC = () => {
  const { account, isConnected, connectWallet, disconnectWallet } = useWeb3();
  const [copied, setCopied] = useState(false);

  const handleConnect = async () => {
    try {
      await connectWallet();
      toast.success('Kết nối ví thành công!');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const handleCopyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shortAddress = account ? `${account.slice(0, 6)}...${account.slice(-4)}` : '';

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-lg border border-green-300">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-semibold text-green-800">Đã kết nối</span>
          <button
            onClick={handleCopyAddress}
            className="ml-2 flex items-center gap-1 hover:bg-green-200 px-2 py-1 rounded transition"
            title={account || ''}
          >
            <span className="text-xs font-mono text-green-700">{shortAddress}</span>
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4 text-green-600" />
            )}
          </button>
        </div>
        <Button
          onClick={disconnectWallet}
          variant="outline"
          size="sm"
          className="text-red-600 border-red-300 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 mr-1" />
          Ngắt kết nối
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      className="bg-blue-600 hover:bg-blue-700 text-white"
    >
      <Wallet className="h-4 w-4 mr-2" />
      Kết nối Ví
    </Button>
  );
};
