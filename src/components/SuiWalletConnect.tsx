import React from 'react';
import { ConnectButton, useWallet } from '@mysten/wallet-kit';
import { useSui } from '@/contexts/SuiContext';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export const SuiWalletConnect: React.FC = () => {
  const { isConnected, address, walletName } = useSui();
  const wallet = useWallet();
  const [copied, setCopied] = React.useState(false);

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-100 to-blue-100 px-4 py-2 rounded-lg border border-cyan-300">
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-semibold text-cyan-800">Đã kết nối {walletName}</span>
          <button
            onClick={handleCopyAddress}
            className="ml-2 flex items-center gap-1 hover:bg-cyan-200 px-2 py-1 rounded transition"
            title={address}
          >
            <span className="text-xs font-mono text-cyan-700">{shortAddress}</span>
            {copied ? (
              <Check className="h-4 w-4 text-cyan-600" />
            ) : (
              <Copy className="h-4 w-4 text-cyan-600" />
            )}
          </button>
        </div>
        <Button
          onClick={() => wallet.disconnect()}
          variant="outline"
          size="sm"
          className="text-red-600 border-red-300 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 mr-1" />
          Ngắt
        </Button>
      </div>
    );
  }

  return (
    <ConnectButton />
  );
};
