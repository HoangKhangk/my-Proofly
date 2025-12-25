import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CheckCircle, AlertCircle, User, Mail, Phone, Zap, ArrowRight } from 'lucide-react';

interface WorkshopAttendant {
  id: string;
  workshopCode: string;
  name: string;
  email: string;
  phone: string;
  attendedAt: string;
}

export default function AttendWorkshop() {
  const { workshopCode } = useParams<{ workshopCode: string }>();
  const navigate = useNavigate();

  const [code, setCode] = useState(workshopCode || '');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [showManualInput, setShowManualInput] = useState(!workshopCode);
  const [workshop, setWorkshop] = useState<any>(null);

  const loadWorkshop = (workshopCodeInput: string) => {
    // Load từ localStorage
    const workshops = getAllWorkshops();
    const found = workshops.find(w => w.code === workshopCodeInput);
    if (found) {
      setWorkshop(found);
      setCode(workshopCodeInput);
      setShowManualInput(false);
    } else {
      toast.error('Mã Workshop không hợp lệ!');
    }
  };

  const getAllWorkshops = () => {
    const result = [];
    for (const key in localStorage) {
      if (key.startsWith('workshops_')) {
        const data = localStorage.getItem(key);
        if (data) {
          result.push(...JSON.parse(data));
        }
      }
    }
    return result;
  };

  useEffect(() => {
    if (workshopCode) {
      loadWorkshop(workshopCode);
    }
  }, [workshopCode]);

  const handleManualCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadWorkshop(manualCode);
  };

  const handleAttend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workshop) {
      toast.error('Vui lòng nhập mã workshop hợp lệ');
      return;
    }

    if (!name.trim() || !email.trim() || !phone.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Email không hợp lệ');
      return;
    }

    // Validate phone
    if (phone.length < 10) {
      toast.error('Số điện thoại không hợp lệ');
      return;
    }

    // Save attendance record
    const attendant: WorkshopAttendant = {
      id: crypto.randomUUID(),
      workshopCode: workshop.code,
      name,
      email,
      phone,
      attendedAt: new Date().toISOString(),
    };

    // Save to localStorage
    const key = `workshop_attendants_${workshop.code}`;
    const existing = localStorage.getItem(key);
    const attendants = existing ? JSON.parse(existing) : [];
    attendants.push(attendant);
    localStorage.setItem(key, JSON.stringify(attendants));

    setIsSubmitted(true);
    toast.success('Đã ghi nhận điểm danh thành công!');

    // Reset form
    setTimeout(() => {
      setName('');
      setEmail('');
      setPhone('');
      setIsSubmitted(false);
      setCode('');
      setWorkshop(null);
      setShowManualInput(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border border-amber-200/50 bg-white/95 backdrop-blur overflow-hidden">
        <div className="relative h-32 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500">
          <div className="absolute inset-0 opacity-20 bg-white" />
          <div className="relative h-full flex items-center justify-center">
            <Zap className="h-16 w-16 text-white" />
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Điểm Danh Workshop</h1>
            <p className="text-sm text-slate-600">
              {workshop
                ? `Workshop: ${workshop.name}`
                : 'Nhập mã workshop để bắt đầu'}
            </p>
          </div>

          {/* Manual Code Input */}
          {showManualInput && (
            <form onSubmit={handleManualCodeSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="manual-code" className="font-semibold text-slate-700">
                  Mã Workshop
                </Label>
                <Input
                  id="manual-code"
                  placeholder="Ví dụ: WS2024001"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="border-amber-300 focus:border-amber-500"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold"
              >
                Tiếp Tục
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>
          )}

          {/* Attendance Form */}
          {workshop && !isSubmitted && (
            <form onSubmit={handleAttend} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-semibold text-slate-700 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Họ & Tên
                </Label>
                <Input
                  id="name"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-amber-300 focus:border-amber-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold text-slate-700 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-amber-300 focus:border-amber-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="font-semibold text-slate-700 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Số Điện Thoại
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="border-amber-300 focus:border-amber-500"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold h-11"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Xác Nhận Điểm Danh
              </Button>
            </form>
          )}

          {/* Success Message */}
          {isSubmitted && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-400 rounded-full animate-pulse opacity-50" />
                  <CheckCircle className="h-16 w-16 text-green-500 relative" />
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-slate-900 mb-2">Thành Công!</h2>
                <p className="text-sm text-slate-600">
                  Bạn đã được ghi nhận điểm danh workshop. Cảm ơn bạn!
                </p>
              </div>
            </div>
          )}

          {/* Info */}
          {workshop && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-900">
                  <p className="font-medium">Thông tin workshop:</p>
                  <p className="text-xs mt-1">{workshop.description || 'Không có mô tả'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
