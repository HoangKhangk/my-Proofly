import React, { useState } from 'react';
import { useSuiWallet } from '@/contexts/SuiWalletContext';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, Copy, Check, Loader2, AlertCircle, Play } from 'lucide-react';
import { toast } from 'sonner';

export const SuiWalletButton: React.FC = () => {
  const { account, isConnected, isLoading, connect, disconnect } = useSuiWallet();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMockOption, setShowMockOption] = useState(false);

  const handleConnect = async () => {
    setError(null);
    try {
      await connect();
      toast.success('Connected to Sui Wallet!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      setError(errorMessage);
      toast.error(errorMessage);
      setShowMockOption(true);
    }
  };

  const handleMockConnect = async () => {
    setError(null);
    try {
      localStorage.setItem('sui_mock_mode', 'true');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to enable mock mode');
    }
  };

  const handleCopy = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Address copied!');
    }
  };

  const shortAddress = account ? `${account.slice(0, 6)}...${account.slice(-4)}` : '';

  if (isConnected && account) {
    const isMockMode = localStorage.getItem('sui_mock_mode') === 'true';
    
    return (
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
          isMockMode 
            ? 'bg-yellow-100 border-yellow-300' 
            : 'bg-gradient-to-r from-cyan-100 to-blue-100 border-cyan-300'
        }`}>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{
            backgroundColor: isMockMode ? '#ca8a04' : '#06b6d4'
          }} />
          <span className={`text-sm font-semibold ${
            isMockMode ? 'text-yellow-800' : 'text-cyan-800'
          }`}>
            {isMockMode ? 'Mock Wallet' : 'Sui Connected'}
          </span>
          <button
            onClick={handleCopy}
            className={`ml-2 flex items-center gap-1 rounded transition ${
              isMockMode
                ? 'hover:bg-yellow-200 px-2 py-1'
                : 'hover:bg-cyan-200 px-2 py-1'
            }`}
            title={account}
          >
            <span className={`text-xs font-mono ${
              isMockMode ? 'text-yellow-700' : 'text-cyan-700'
            }`}>{shortAddress}</span>
            {copied ? (
              <Check className={`h-4 w-4 ${
                isMockMode ? 'text-yellow-600' : 'text-cyan-600'
              }`} />
            ) : (
              <Copy className={`h-4 w-4 ${
                isMockMode ? 'text-yellow-600' : 'text-cyan-600'
              }`} />
            )}
          </button>
        </div>
        <Button
          onClick={disconnect}
          variant="outline"
          size="sm"
          className="text-red-600 border-red-300 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 mr-1" />
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <Button
        onClick={handleConnect}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="h-4 w-4 mr-2" />
            Connect Sui Wallet
          </>
        )}
      </Button>
      
      {error && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-3 flex flex-col gap-2">
          <div className="flex gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800 font-medium">Connection Error</p>
              <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
          </div>
          
          {showMockOption && (
            <Button
              onClick={handleMockConnect}
              variant="outline"
              size="sm"
              className="w-full border-amber-300 hover:bg-amber-50 text-amber-700"
            >
              <Play className="h-4 w-4 mr-2" />
              Use Mock Wallet (Test Mode)
            </Button>
          )}

          <p className="text-xs text-red-600 mt-2">
            <a 
              href="https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmilocjcilehmwajfc37d4eebae"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-red-700"
            >
              Install Sui Wallet Extension
            </a>
          </p>
        </div>
      )}
    </div>
  );
};
