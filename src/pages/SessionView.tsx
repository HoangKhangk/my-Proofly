import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { getSessionById, updateSession, getRecordsBySessionId, getClassById } from '@/lib/storage';
import { AttendanceSession, AttendanceRecord, Class, StudentInfo } from '@/types';
import { toast } from 'sonner';
import { ArrowLeft, QrCode, Users, Download, XCircle, Copy, Clock, CheckCircle2, TrendingUp, MapPin, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { QRCodeSVG } from 'qrcode.react';
import { formatDistance } from '@/lib/geolocation';

export default function SessionView() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { teacher } = useAuth();
  const [session, setSession] = useState<AttendanceSession | null>(null);
  const [classData, setClassData] = useState<Class | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [showQR, setShowQR] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!teacher || !sessionId) {
      navigate('/dashboard');
      return;
    }
    loadSessionData();
    loadRecords();
    
    // Auto refresh records every 2 seconds for real-time updates
    const interval = setInterval(() => {
      loadRecords();
    }, 2000);

    return () => clearInterval(interval);
  }, [teacher, sessionId, navigate]);

  const loadSessionData = () => {
    if (sessionId) {
      const sess = getSessionById(sessionId);
      if (sess) {
        setSession(sess);
        const cls = getClassById(sess.classId);
        setClassData(cls || null);
      } else {
        toast.error('Không tìm thấy phiên điểm danh!');
        navigate('/dashboard');
      }
    }
  };

  const loadRecords = () => {
    if (sessionId) {
      const sessionRecords = getRecordsBySessionId(sessionId);
      setRecords(sessionRecords.sort((a, b) => new Date(b.attendedAt).getTime() - new Date(a.attendedAt).getTime()));
    }
  };

  const handleEndSession = () => {
    if (sessionId) {
      updateSession(sessionId, {
        isActive: false,
        endTime: new Date().toISOString(),
      });
      loadSessionData();
      toast.success('Đã kết thúc phiên điểm danh!');
    }
  };

  const handleExportCSV = () => {
    if (!records.length) {
      toast.error('Chưa có dữ liệu để xuất!');
      return;
    }

    const csv = [
      ['STT', 'Họ và Tên', 'MSSV', 'Email', 'Thời gian điểm danh'],
      ...records.map((record, index) => [
        index + 1,
        record.studentName,
        record.studentId,
        record.studentEmail,
        format(new Date(record.attendedAt), 'dd/MM/yyyy HH:mm:ss', { locale: vi }),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `diem-danh-${session?.sessionName}-${format(new Date(), 'ddMMyyyy')}.csv`;
    link.click();
    toast.success('Đã xuất file CSV!');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.origin + `/attend/${session?.sessionCode}`);
    toast.success('Đã sao chép link!');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validExtensions = ['.csv', '.txt'];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
      toast.error('Chỉ hỗ trợ file CSV hoặc TXT!');
      event.target.value = '';
      return;
    }

    setIsUploading(true);
    try {
      // Read file as text with proper encoding
      const arrayBuffer = await file.arrayBuffer();
      const decoder = new TextDecoder('utf-8');
      const text = decoder.decode(arrayBuffer);
      
      // Split by newline and filter empty lines
      const lines = text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.match(/^[\s\u0000]+$/));
      
      if (lines.length === 0) {
        toast.error('File rỗng hoặc không có dữ liệu hợp lệ!');
        return;
      }

      const students: StudentInfo[] = [];
      let validCount = 0;
      let skipCount = 0;
      
      // Parse CSV/TXT file
      // Expected format: name,studentId,email or just name,studentId
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Skip header row if it contains common header keywords
        if (i === 0 && line.match(/^(STT|Họ|Tên|MSSV|ID|Email|Name)/i)) {
          skipCount++;
          continue;
        }

        // Check for valid characters (avoid binary data)
        if (line.match(/[\x00-\x08\x0B\x0C\x0E-\x1F]/)) {
          console.warn('Skipping line with invalid characters');
          skipCount++;
          continue;
        }

        const parts = line.split(',').map(p => {
          // Remove quotes and trim
          return p.trim().replace(/^["']|["']$/g, '');
        }).filter(p => p);
        
        // Need at least 2 parts: name and studentId
        if (parts.length >= 2) {
          const [name, studentId, email] = parts;
          
          // Validate data
          if (name.length < 2 || studentId.length < 2) {
            skipCount++;
            continue;
          }

          students.push({
            id: crypto.randomUUID(),
            name: name.trim(),
            studentId: studentId.trim(),
            email: (email || '').trim(),
          });
          validCount++;
        } else {
          skipCount++;
        }
      }

      if (students.length === 0) {
        toast.error(`Không tìm dữ liệu hợp lệ! (Bỏ qua ${skipCount} dòng)`);
        return;
      }

      // Update session with students
      if (sessionId) {
        updateSession(sessionId, { students });
        loadSessionData();
        const message = skipCount > 0 
          ? `Đã thêm ${validCount} sinh viên (bỏ qua ${skipCount} dòng không hợp lệ)`
          : `Đã thêm ${validCount} sinh viên!`;
        toast.success(message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Lỗi khi đọc file! Kiểm tra encoding UTF-8.');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  if (!session || !classData) {
    return null;
  }

  const attendanceUrl = `${window.location.origin}/attend/${session.sessionCode}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/class/${session.classId}`)} 
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại Lớp học
          </Button>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{session.sessionName}</h1>
              <div className="flex items-center space-x-3 mt-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                  {classData.className}
                </span>
                <span className="text-gray-600 flex items-center">
                  <Clock className="h-4 w-4 mr-1.5 text-indigo-600" />
                  {format(new Date(session.startTime), 'dd/MM/yyyy HH:mm', { locale: vi })}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {session.isActive && (
                <>
                  <Button 
                    onClick={() => setShowQR(true)} 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Hiển thị QR
                  </Button>
                  <Button 
                    onClick={handleEndSession} 
                    className="bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Kết thúc
                  </Button>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Button 
                      disabled={isUploading}
                      className="bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all pointer-events-none"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploading ? 'Đang tải...' : 'Upload Danh Sách'}
                    </Button>
                  </div>
                </>
              )}
              <Button 
                onClick={handleExportCSV} 
                variant="outline"
                className="border-gray-300 hover:bg-gray-100"
              >
                <Download className="h-4 w-4 mr-2" />
                Xuất CSV
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
             <CardContent className="pt-6">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm text-gray-600 font-medium">Đã Điểm Danh</p>
                   <p className="text-3xl font-bold text-green-600 mt-1">{records.length}</p>
                 </div>
                 <CheckCircle className="h-12 w-12 text-green-100" />
               </div>
             </CardContent>
           </Card>
           <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
             <CardContent className="pt-6">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm text-gray-600 font-medium">Chưa Điểm Danh</p>
                   <p className="text-3xl font-bold text-amber-600 mt-1">
                     {session.students ? session.students.length - records.length : 0}
                   </p>
                 </div>
                 <AlertCircle className="h-12 w-12 text-amber-100" />
               </div>
             </CardContent>
           </Card>
           <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
             <CardContent className="pt-6">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm text-gray-600 font-medium">Tổng Sinh Viên</p>
                   <p className="text-3xl font-bold text-indigo-600 mt-1">
                     {session.students ? session.students.length : records.length}
                   </p>
                 </div>
                 <Users className="h-12 w-12 text-indigo-100" />
               </div>
             </CardContent>
           </Card>
           <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
             <CardContent className="pt-6">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm text-gray-600 font-medium">Tỷ Lệ</p>
                   <p className="text-3xl font-bold text-blue-600 mt-1">
                     {session.students ? Math.round((records.length / session.students.length) * 100) : 0}%
                   </p>
                 </div>
                 <TrendingUp className="h-12 w-12 text-blue-100" />
               </div>
             </CardContent>
           </Card>
         </div>
       </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">
              Thống Kê Điểm Danh
            </CardTitle>
          </CardHeader>
          <CardContent>
            {session.students && session.students.length > 0 ? (
              <Tabs defaultValue="attended" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                  <TabsTrigger value="attended">
                    ✓ Đã Điểm Danh ({records.length})
                  </TabsTrigger>
                  <TabsTrigger value="absent">
                    ✗ Chưa Điểm Danh ({session.students.length - records.length})
                  </TabsTrigger>
                </TabsList>

                {/* Attended Tab */}
                <TabsContent value="attended" className="space-y-4">
                  {records.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">Chưa có sinh viên nào điểm danh</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 bg-green-50">
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">STT</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Họ và Tên</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">MSSV</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Thời gian</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Vị Trí GPS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {records.map((record, index) => (
                            <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 text-gray-900 font-medium">{index + 1}</td>
                              <td className="px-4 py-3 text-gray-900 font-medium">{record.studentName}</td>
                              <td className="px-4 py-3 text-gray-600">{record.studentId}</td>
                              <td className="px-4 py-3 text-gray-600">
                                {format(new Date(record.attendedAt), 'HH:mm:ss', { locale: vi })}
                              </td>
                              <td className="px-4 py-3">
                                {record.location ? (
                                  <div className="flex items-start space-x-1">
                                    <MapPin className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                                    <div className="text-xs">
                                      <div className="text-gray-700 font-medium">
                                        {record.location.latitude.toFixed(4)}, {record.location.longitude.toFixed(4)}
                                      </div>
                                      {record.distanceFromClass !== undefined && (
                                        <div className={`text-xs ${record.distanceFromClass > 1 ? 'text-orange-600 font-semibold' : 'text-green-600'}`}>
                                          {formatDistance(record.distanceFromClass)}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-xs">Không có</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </TabsContent>

                {/* Absent Tab */}
                <TabsContent value="absent" className="space-y-4">
                  {(() => {
                    // Match by studentId (case-insensitive) - primary key
                    const attendedStudentIds = new Set(
                      records.map(r => r.studentId.toLowerCase().trim())
                    );
                    const absentStudents = session.students!.filter(
                      s => !attendedStudentIds.has(s.studentId.toLowerCase().trim())
                    );
                    
                    return absentStudents.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-2" />
                        <p className="text-gray-600 font-medium">Tất cả sinh viên đã điểm danh!</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200 bg-amber-50">
                              <th className="px-4 py-3 text-left font-semibold text-gray-700">STT</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700">Họ và Tên</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700">MSSV</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {absentStudents.map((student, index) => (
                              <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 text-gray-900 font-medium">{index + 1}</td>
                                <td className="px-4 py-3 text-gray-900 font-medium">{student.name}</td>
                                <td className="px-4 py-3 text-gray-600">{student.studentId}</td>
                                <td className="px-4 py-3 text-gray-600 text-xs">{student.email}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </TabsContent>
              </Tabs>
            ) : (
              <>
            {records.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-medium">Chưa có sinh viên nào điểm danh</p>
                {session.isActive && (
                  <p className="text-gray-500 mt-2">Sinh viên quét QR code hoặc truy cập link để điểm danh</p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">STT</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Họ và Tên</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">MSSV</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Thời gian</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Vị Trí GPS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {records.map((record, index) => (
                      <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-900 font-medium">{index + 1}</td>
                        <td className="px-4 py-3 text-gray-900 font-medium">{record.studentName}</td>
                        <td className="px-4 py-3 text-gray-600">{record.studentId}</td>
                        <td className="px-4 py-3 text-gray-600">{record.studentEmail}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {format(new Date(record.attendedAt), 'HH:mm:ss', { locale: vi })}
                        </td>
                        <td className="px-4 py-3">
                          {record.location ? (
                            <div className="flex items-start space-x-1">
                              <MapPin className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                              <div className="text-xs">
                                <div className="text-gray-700 font-medium">
                                  {record.location.latitude.toFixed(4)}, {record.location.longitude.toFixed(4)}
                                </div>
                                {record.distanceFromClass !== undefined && (
                                  <div className={`text-xs ${record.distanceFromClass > 1 ? 'text-orange-600 font-semibold' : 'text-green-600'}`}>
                                    {formatDistance(record.distanceFromClass)}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">Không có</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
              </>
            )}
          </CardContent>
        </Card>
      </main>

      {/* QR Code Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mã QR Điểm Danh</DialogTitle>
            <DialogDescription>Sinh viên quét mã này hoặc truy cập link để điểm danh</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <QRCodeSVG value={attendanceUrl} size={280} level="H" margin={1} />
            </div>
            <div className="w-full space-y-3 text-center">
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Hoặc sao chép link</p>
              <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-3">
                <input
                  type="text"
                  value={attendanceUrl}
                  readOnly
                  className="flex-1 bg-gray-50 text-xs text-gray-600 border-0 outline-none font-mono"
                />
                <Button
                  size="sm"
                  onClick={copyToClipboard}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="w-full pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                <span className="font-semibold">Mã phiên:</span> {session.sessionCode}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}