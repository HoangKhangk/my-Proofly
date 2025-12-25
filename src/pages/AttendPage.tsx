import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getSessionByCode, saveRecord, getClassById } from '@/lib/storage';
import { AttendanceSession, AttendanceRecord, Class, Location } from '@/types';
import { toast } from 'sonner';
import { CheckCircle, QrCode, AlertCircle, Book, Mail, User, ArrowRight, MapPin, Loader2, Shield, AlertTriangle } from 'lucide-react';
import { getCurrentLocation, calculateDistance, formatDistance } from '@/lib/geolocation';
import { SuiWalletButton } from '@/components/SuiWalletButton';
import { useSuiWallet } from '@/contexts/SuiWalletContext';

export default function AttendPage() {
  const { sessionCode } = useParams<{ sessionCode: string }>();
  const navigate = useNavigate();
  const { isConnected } = useSuiWallet();
  
  const [session, setSession] = useState<AttendanceSession | null>(null);
  const [classData, setClassData] = useState<Class | null>(null);
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [location, setLocation] = useState<Location | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [distanceFromClass, setDistanceFromClass] = useState<number | null>(null);
  const [geofenceStatus, setGeofenceStatus] = useState<'inside' | 'outside' | 'warning' | null>(null);

  useEffect(() => {
    if (sessionCode) {
      loadSession(sessionCode);
    } else {
      setShowManualInput(true);
    }
  }, [sessionCode]);

  const loadSession = (code: string) => {
    const sess = getSessionByCode(code);
    if (sess) {
      if (!sess.isActive) {
        toast.error('Phiên điểm danh đã kết thúc!');
        return;
      }
      setSession(sess);
      const cls = getClassById(sess.classId);
      setClassData(cls || null);
    } else {
      toast.error('Mã phiên không hợp lệ!');
    }
  };

  const handleManualCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadSession(manualCode);
    setShowManualInput(false);
  };

  const checkGeofence = (userLat: number, userLng: number) => {
    if (!classData?.geofence) return 'inside';
    
    const distance = calculateDistance(
      userLat,
      userLng,
      classData.geofence.latitude,
      classData.geofence.longitude
    );
    
    const radiusMeters = classData.geofence.radiusMeters;
    const warningZone = radiusMeters * 1.2; // Vùng cảnh báo = bán kính + 20%
    
    if (distance <= radiusMeters) {
      return 'inside';
    } else if (distance <= warningZone) {
      return 'warning';
    } else {
      return 'outside';
    }
  };

  const requestLocation = async () => {
    setIsGettingLocation(true);
    try {
      const userLocation = await getCurrentLocation();
      setLocation(userLocation);
      
      // Tính khoảng cách nếu lớp có location
      if (classData?.location) {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          classData.location.latitude,
          classData.location.longitude
        );
        setDistanceFromClass(distance);
      }

      // Kiểm tra Geofence
      if (classData?.geofence) {
        const status = checkGeofence(userLocation.latitude, userLocation.longitude);
        setGeofenceStatus(status);
        
        if (status === 'outside') {
          toast.error('Bạn ở ngoài vùng địa chỉ cho phép!');
        } else if (status === 'warning') {
          toast.warning('Cảnh báo: Bạn gần ra khỏi vùng địa chỉ!');
        } else {
          toast.success('Đã lấy vị trí! (Trong vùng địa chỉ)');
        }
      } else {
        toast.success('Đã lấy vị trí!');
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    // Bắt buộc phải có GPS
    if (!location) {
      toast.error('Bạn phải lấy vị trí GPS trước khi xác nhận điểm danh!');
      return;
    }

    try {
       const newRecord: AttendanceRecord = {
         id: crypto.randomUUID(),
         sessionId: session.id,
         studentName: studentName.trim(),
         studentId: studentId.trim(),
         studentEmail: studentEmail.trim(),
         attendedAt: new Date().toISOString(),
         location: location,
         distanceFromClass: distanceFromClass || undefined,
         isWithinGeofence: geofenceStatus === 'inside',
         geofenceStatus: geofenceStatus || 'inside',
       };

       saveRecord(newRecord);

      // Ghi vào blockchain nếu ví đã kết nối
      if (isConnected && location) {
        toast.info('Điểm danh thành công! (Blockchain integration coming soon)');
      } else {
        toast.success('Điểm danh thành công!');
      }

      setIsSubmitted(true);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  if (showManualInput) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 p-4">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
            <CardTitle className="flex items-center space-x-2 text-xl">
              <QrCode className="h-6 w-6 text-indigo-600" />
              <span>Nhập Mã Điểm Danh</span>
            </CardTitle>
            <CardDescription className="text-base mt-2">Nhập mã phiên từ giáo viên hoặc quét QR code</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleManualCodeSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="manual-code" className="text-base font-semibold">Mã Phiên</Label>
                <Input
                  id="manual-code"
                  placeholder="Nhập mã phiên..."
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="h-11 text-base"
                  autoFocus
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-11 text-base font-semibold">
                Tiếp tục
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session || !classData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 via-red-500 to-pink-600 p-4">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardContent className="pt-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy phiên</h3>
              <p className="text-gray-600 mb-6">Vui lòng kiểm tra lại mã QR hoặc liên hệ giáo viên</p>
              <Button 
                onClick={() => setShowManualInput(true)} 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-11 font-semibold"
              >
                Nhập mã thủ công
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 via-green-500 to-emerald-600 p-4">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardContent className="pt-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Điểm danh thành công!</h3>
              <p className="text-gray-600 mb-6">Thông tin của bạn đã được ghi nhận</p>
              <div className="bg-gray-50 rounded-lg p-5 text-left space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <Book className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Lớp</p>
                    <p className="text-sm font-medium text-gray-900">{classData.className}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <QrCode className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Buổi</p>
                    <p className="text-sm font-medium text-gray-900">{session.sessionName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Họ tên</p>
                    <p className="text-sm font-medium text-gray-900">{studentName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">MSSV</p>
                    <p className="text-sm font-medium text-gray-900">{studentId}</p>
                  </div>
                </div>

              </div>
              <Button 
                onClick={() => setShowManualInput(true)}
                variant="outline"
                className="w-full border-gray-300 hover:bg-gray-100"
              >
                Điểm danh sinh viên khác
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b pb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100">
              <CheckCircle className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Điểm Danh Sinh Viên</CardTitle>
          <CardDescription className="space-y-2 mt-2">
            <div className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
              <Book className="h-3.5 w-3.5 mr-1.5" />
              {classData.className}
            </div>
            <div className="inline-flex items-center px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-medium ml-2">
              <QrCode className="h-3.5 w-3.5 mr-1.5" />
              {session.sessionName}
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student-name" className="text-base font-semibold flex items-center">
                <User className="h-4 w-4 mr-2 text-indigo-600" />
                Họ và Tên
              </Label>
              <Input
                id="student-name"
                placeholder="Nguyễn Văn A"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="h-11 text-base"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-id" className="text-base font-semibold flex items-center">
                <User className="h-4 w-4 mr-2 text-indigo-600" />
                Mã Số Sinh Viên
              </Label>
              <Input
                id="student-id"
                placeholder="20210001"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="h-11 text-base"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-email" className="text-base font-semibold flex items-center">
                <Mail className="h-4 w-4 mr-2 text-indigo-600" />
                Email
              </Label>
              <Input
                id="student-email"
                type="email"
                placeholder="sinhvien@example.com"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                className="h-11 text-base"
                required
              />
            </div>

            {/* GPS & Geofencing Section */}
            <div className="space-y-4">
              {/* Geofencing Info Box */}
              {classData?.geofence && (
                <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
                  <div className="flex gap-3">
                    <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Xác thực điểm danh "khó gian lận" hơn GPS</p>
                      <p className="text-xs text-blue-700 mt-1">GPS dễ fake, nên kết hợp thêm:</p>
                      <div className="mt-2 space-y-1 text-xs text-blue-700">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-3.5 w-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span><strong>Geofencing (vùng cho phép)</strong> - Chỉ cho điểm danh trong bán kính <strong>{classData.geofence.radiusMeters}m</strong></span>
                        </div>
                        <div className="flex items-start gap-2 ml-5">
                          <span className="text-blue-600">• Dữ liệu: lat, lng, bán kính, thời gian</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* GPS Location Section */}
              <div className={`rounded-lg p-4 border ${
                geofenceStatus === 'inside' ? 'bg-green-50 border-green-200' :
                geofenceStatus === 'warning' ? 'bg-amber-50 border-amber-200' :
                geofenceStatus === 'outside' ? 'bg-red-50 border-red-200' :
                'bg-indigo-50 border-indigo-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <Label className={`text-base font-semibold flex items-center ${
                    geofenceStatus === 'inside' ? 'text-green-700' :
                    geofenceStatus === 'warning' ? 'text-amber-700' :
                    geofenceStatus === 'outside' ? 'text-red-700' :
                    'text-indigo-700'
                  }`}>
                    <MapPin className="h-4 w-4 mr-2" />
                    Xác Định Vị Trí GPS
                  </Label>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                    geofenceStatus === 'inside' ? 'bg-green-100 text-green-700' :
                    geofenceStatus === 'warning' ? 'bg-amber-100 text-amber-700' :
                    geofenceStatus === 'outside' ? 'bg-red-100 text-red-700' :
                    'bg-indigo-100 text-indigo-700'
                  }`}>
                    {geofenceStatus === 'inside' ? '✓ Trong vùng' :
                     geofenceStatus === 'warning' ? '⚠ Cảnh báo' :
                     geofenceStatus === 'outside' ? '✗ Ngoài vùng' :
                     location ? '✓ Đã có' : 'Chưa có'}
                  </span>
                </div>
                <p className={`text-sm mb-3 ${
                  geofenceStatus === 'inside' ? 'text-green-700' :
                  geofenceStatus === 'warning' ? 'text-amber-700' :
                  geofenceStatus === 'outside' ? 'text-red-700' :
                  'text-gray-600'
                }`}>
                  {location ? (
                    <>
                      <strong>Vị trí:</strong> {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                      <br />
                      {distanceFromClass !== null && classData?.location && (
                        <>
                          <strong>Khoảng cách từ lớp:</strong> {formatDistance(distanceFromClass)}
                          {classData?.geofence && (
                            <>
                              <br />
                              <strong>Bán kính cho phép:</strong> {classData.geofence.radiusMeters}m
                              <br />
                              <strong>Trạng thái:</strong> {
                                geofenceStatus === 'inside' ? '✓ Trong vùng cho phép' :
                                geofenceStatus === 'warning' ? '⚠ Gần ra khỏi vùng' :
                                '✗ Ngoài vùng cho phép'
                              }
                            </>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    'Nhấn nút bên dưới để ghi nhận vị trí GPS của bạn'
                  )}
                </p>
                <Button
                  type="button"
                  onClick={requestLocation}
                  disabled={isGettingLocation}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-10 font-semibold"
                >
                  {isGettingLocation ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang lấy vị trí...
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4 mr-2" />
                      {location ? 'Cập Nhật Vị Trí' : 'Lấy Vị Trí GPS'}
                    </>
                  )}
                </Button>
              </div>

              {/* Warning if outside geofence */}
              {geofenceStatus === 'outside' && classData?.geofence && (
                <div className="bg-red-50 border border-red-300 rounded-lg p-4 flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-800 font-medium">Ngoài vùng điểm danh</p>
                    <p className="text-xs text-red-600 mt-1">
                      Bạn ở ngoài bán kính {classData.geofence.radiusMeters}m từ địa điểm lớp. Vui lòng di chuyển vào vùng cho phép để điểm danh.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-11 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isGettingLocation || !location}
            >
              Xác Nhận Điểm Danh
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}