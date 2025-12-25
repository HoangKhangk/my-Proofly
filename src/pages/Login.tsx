import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useSuiWallet } from '@/contexts/SuiWalletContext';
import { toast } from 'sonner';
import { Wallet, Loader2, AlertCircle, CheckCircle, MapPin, Shield, BarChart3, Zap } from 'lucide-react';
import { Teacher } from '@/types';

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { account, isConnected, isLoading: isWalletLoading, connect } = useSuiWallet();
  
  const [walletError, setWalletError] = useState<string | null>(null);
  const [showMockOption, setShowMockOption] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const handleConnectWallet = async () => {
    setWalletError(null);
    setShowMockOption(false);
    try {
      console.log('Starting wallet connection...');
      // Sui Wallet extension popup will appear automatically
      const address = await connect();
      console.log('Wallet connection successful, address:', address);
      toast.success('Kết nối Sui Wallet thành công!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể kết nối ví';
      console.error('Wallet connection error:', errorMessage);
      setWalletError(errorMessage);
      toast.error(errorMessage);
      setShowMockOption(true);
    }
  };

  const handleMockWallet = async () => {
    // Generate mock account
    const mockAddress = '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    localStorage.setItem('sui_wallet_address', mockAddress);
    localStorage.setItem('sui_mock_mode', 'true');
    
    // Auto-login after setting up mock wallet
    const teacher: Teacher = {
      id: crypto.randomUUID(),
      email: mockAddress,
      name: `Giáo viên ${mockAddress.slice(0, 6)}`,
      createdAt: new Date().toISOString(),
    };
    login(teacher);
    toast.success('Đã đăng nhập bằng Mock Wallet (Chế độ test)!');
    
    setTimeout(() => navigate('/dashboard'), 100);
  };

  const handleManualLogin = async () => {
    if (!manualAddress.trim()) {
      toast.error('Vui lòng nhập địa chỉ ví');
      return;
    }
    
    const teacher: Teacher = {
      id: crypto.randomUUID(),
      email: manualAddress,
      name: `Giáo viên ${manualAddress.slice(0, 6)}`,
      createdAt: new Date().toISOString(),
    };
    
    login(teacher);
    localStorage.setItem('sui_wallet_address', manualAddress);
    toast.success('Đã đăng nhập!');
    navigate('/dashboard');
  };

  // Auto login with wallet when connected
  useEffect(() => {
    const autoLogin = async () => {
      if (isConnected && account && !isAuthenticated) {
        const teacher: Teacher = {
          id: crypto.randomUUID(),
          email: account,
          name: `Giáo viên ${account.slice(0, 6)}`,
          createdAt: new Date().toISOString(),
        };
        
        login(teacher);
        toast.success('Đã đăng nhập bằng Sui Wallet!');
        // Delay navigation để ensure state cập nhật
        setTimeout(() => navigate('/dashboard'), 100);
      }
    };
    autoLogin();
  }, [isConnected, account]);

  const features = [
    {
      icon: MapPin,
      title: 'Xác định vị trí GPS',
      description: 'Tự động ghi nhận vị trí học sinh khi điểm danh',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: Shield,
      title: 'Bảo mật Blockchain',
      description: 'Dữ liệu được lưu trữ an toàn trên blockchain Sui',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: BarChart3,
      title: 'Báo cáo Chi tiết',
      description: 'Thống kê, phân tích điểm danh toàn diện',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Zap,
      title: 'Nhanh & Hiệu Quả',
      description: 'Điểm danh chỉ trong vài giây, không phức tạp',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const stats = [
    { number: '500+', label: 'Giáo viên' },
    { number: '10,000+', label: 'Sinh viên' },
    { number: '99.9%', label: 'Độ chính xác' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">PROOFLY</h1>
                <p className="text-xs text-slate-400">Hệ thống điểm danh thông minh</p>
              </div>
            </div>
            <nav className="flex items-center gap-6">
              <a href="#features" className="text-slate-300 hover:text-white transition text-sm font-medium">
                Tính năng
              </a>
              <a href="#about" className="text-slate-300 hover:text-white transition text-sm font-medium">
                Về chúng tôi
              </a>
            </nav>
          </div>
        </header>

        {/* Hero Section with Login */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl w-full items-center">
            {/* Left: Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
                  Điểm Danh <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Thông Minh</span>
                </h2>
                <p className="text-xl text-slate-300 leading-relaxed">
                  Nền tảng quản lý điểm danh hiện đại với công nghệ GPS và Blockchain, giúp giáo viên tiết kiệm thời gian và đảm bảo độ chính xác tuyệt đối.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {stats.map((stat, idx) => (
                  <div key={idx} className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-lg p-4 text-center hover:border-cyan-500/50 transition">
                    <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      {stat.number}
                    </div>
                    <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Features Grid */}
              <div id="features" className="space-y-4">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Tính Năng Chính</h3>
                <div className="grid grid-cols-2 gap-4">
                  {features.map((feature, idx) => {
                    const Icon = feature.icon;
                    return (
                      <div
                        key={idx}
                        className="group relative bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-lg p-4 hover:border-cyan-500/50 transition overflow-hidden"
                      >
                        <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 transition`}></div>
                        <div className="relative">
                          <Icon className={`h-5 w-5 mb-2 text-cyan-400`} />
                          <p className="text-sm font-semibold text-white mb-1">{feature.title}</p>
                          <p className="text-xs text-slate-400">{feature.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Login Card */}
            <div className="flex items-center justify-center">
              <Card className="w-full max-w-lg shadow-2xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-xl overflow-hidden">
                <div className="relative">
                  {/* Gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10"></div>
                  
                  <div className="relative p-8 lg:p-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 mb-4 shadow-lg">
                        <MapPin className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">Đăng Nhập</h3>
                      <p className="text-sm text-slate-400">Kết nối ví Sui để bắt đầu</p>
                    </div>

                    {/* Wallet Connect Section */}
                    <div className="space-y-4">
                      <Button
                        onClick={handleConnectWallet}
                        disabled={isWalletLoading}
                        className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all"
                      >
                        {isWalletLoading ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Đang kết nối...
                          </>
                        ) : (
                          <>
                            <Wallet className="h-5 w-5 mr-2" />
                            Kết Nối Sui Wallet
                          </>
                        )}
                      </Button>

                      {walletError && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex gap-3">
                          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm text-red-300 font-medium">Lỗi Kết Nối</p>
                            <p className="text-xs text-red-400/80 mt-1">
                              {walletError.includes('not found') 
                                ? '⚠️ Hãy mở Sui Wallet extension, unlock ví bằng password, rồi reload trang này'
                                : walletError
                              }
                            </p>
                            {walletError.includes('not found') && (
                              <button
                                onClick={() => window.location.reload()}
                                className="text-xs text-cyan-400 hover:text-cyan-300 mt-2 underline"
                              >
                                Reload trang
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {showMockOption && (
                        <>
                          <Button
                            onClick={handleMockWallet}
                            variant="outline"
                            className="w-full border-amber-500/50 hover:bg-amber-500/10 text-amber-300 font-semibold h-11"
                          >
                            Dùng Chế Độ Test (Mock Wallet)
                          </Button>
                          <Button
                            onClick={() => setShowManualInput(true)}
                            variant="outline"
                            className="w-full border-slate-500/50 hover:bg-slate-500/10 text-slate-300 font-semibold h-11"
                          >
                            Nhập Địa Chỉ Ví Thủ Công
                          </Button>
                        </>
                      )}

                      {!showMockOption && (
                        <div className="text-center">
                          <button
                            onClick={() => setShowMockOption(true)}
                            className="text-sm text-slate-400 hover:text-slate-200 transition"
                          >
                            Có vấn đề? Thử các tùy chọn khác
                          </button>
                        </div>
                      )}

                      {/* Info Box */}
                      <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
                        <div className="flex gap-3">
                          <CheckCircle className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-slate-200">Bảo mật cao</p>
                            <p className="text-xs text-slate-400">Dữ liệu được bảo vệ bằng công nghệ blockchain</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <CheckCircle className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-slate-200">Không cần email</p>
                            <p className="text-xs text-slate-400">Đăng nhập với ví crypto của bạn</p>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-700/50 pt-4 space-y-2">
                        <p className="text-xs text-slate-400 text-center">
                          Cần cài{' '}
                          <a
                            href="https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmilocjcilehmwajfc37d4eebae"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 underline font-medium"
                          >
                            Sui Wallet Extension
                          </a>
                          {' '}để tiếp tục
                        </p>
                        <div className="text-xs text-slate-500 text-center space-y-1">
                          <p className="font-medium text-slate-400">Hướng dẫn:</p>
                          <p>1. Cài Sui Wallet từ Chrome Web Store</p>
                          <p>2. Mở Sui Wallet extension</p>
                          <p>3. Unlock ví bằng password</p>
                          <p>4. Reload trang này rồi kết nối</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Manual Input Modal */}
              {showManualInput && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                  <Card className="w-full max-w-md shadow-2xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-xl">
                    <div className="relative p-6 lg:p-8">
                      <h3 className="text-xl font-bold text-white mb-4">Nhập Địa Chỉ Ví Sui</h3>
                      <p className="text-sm text-slate-300 mb-4">
                        Nhập địa chỉ ví Sui của bạn để đăng nhập
                      </p>
                      
                      <input
                        type="text"
                        value={manualAddress}
                        onChange={(e) => setManualAddress(e.target.value)}
                        placeholder="0x..."
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 mb-4 focus:outline-none focus:border-cyan-500"
                      />
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={handleManualLogin}
                          className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold"
                        >
                          Đăng Nhập
                        </Button>
                        <Button
                          onClick={() => {
                            setShowManualInput(false);
                            setManualAddress('');
                          }}
                          variant="outline"
                          className="flex-1 border-slate-500 hover:bg-slate-700"
                        >
                          Hủy
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-700/50 backdrop-blur-sm bg-slate-900/50 mt-12">
          <div id="about" className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <h4 className="text-white font-bold mb-3">Về PROOFLY</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Nền tảng quản lý điểm danh hiện đại cho các trường đại học và cơ sở đào tạo, kết hợp công nghệ GPS và Blockchain.
                </p>
              </div>
              <div>
                <h4 className="text-white font-bold mb-3">Lợi Ích</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex gap-2">
                    <CheckCircle className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                    Tiết kiệm thời gian
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                    Độ chính xác cao
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                    Dữ liệu bảo mật
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-3">Hỗ Trợ</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><a href="#" className="hover:text-cyan-400 transition">Hướng dẫn sử dụng</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition">Câu hỏi thường gặp</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition">Liên hệ chúng tôi</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-slate-700/50 pt-8 flex justify-between items-center">
              <p className="text-slate-500 text-sm">© 2025 PROOFLY. All rights reserved.</p>
              <div className="flex gap-6 text-sm">
                <a href="#" className="text-slate-500 hover:text-slate-300 transition">Privacy</a>
                <a href="#" className="text-slate-500 hover:text-slate-300 transition">Terms</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
