import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { getClassById, getSessions, saveSession, getRecordsBySessionId } from '@/lib/storage';
import { Class, AttendanceSession, StudentInfo } from '@/types';
import { toast } from 'sonner';
import { ArrowLeft, Plus, QrCode, Clock, CheckCircle, XCircle, Users, Calendar, MapPin, Upload, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function ClassDetail() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { teacher } = useAuth();
  const [classData, setClassData] = useState<Class | null>(null);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  useEffect(() => {
    if (!teacher || !classId) {
      navigate('/dashboard');
      return;
    }
    loadData();
  }, [teacher, classId, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (classId) {
        const cls = getClassById(classId);
        if (cls) {
          setClassData(cls);
          const classSessions = getSessions(classId);
          setSessions(classSessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } else {
          toast.error('Không tìm thấy lớp học!');
          navigate('/dashboard');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const csv = event.target?.result as string;
          const lines = csv.split('\n').filter(line => line.trim());
          
          if (lines.length < 2) {
            toast.error('File Excel phải có header và ít nhất 1 dòng dữ liệu!');
            return;
          }

          // Parse CSV (header: name, studentId, email)
          const header = lines[0].split(',').map(h => h.trim().toLowerCase());
          const nameIdx = header.findIndex(h => h.includes('tên') || h.includes('name'));
          const idIdx = header.findIndex(h => h.includes('mã') || h.includes('id'));
          const emailIdx = header.findIndex(h => h.includes('email'));

          if (nameIdx === -1 || idIdx === -1) {
            toast.error('File phải có cột "Tên" và "Mã SV"!');
            return;
          }

          const parsedStudents: StudentInfo[] = [];
          for (let i = 1; i < lines.length; i++) {
            const columns = lines[i].split(',').map(c => c.trim());
            if (columns[nameIdx] && columns[idIdx]) {
              parsedStudents.push({
                id: crypto.randomUUID(),
                name: columns[nameIdx],
                studentId: columns[idIdx],
                email: emailIdx !== -1 ? columns[emailIdx] : `${columns[idIdx]}@student.edu.vn`
              });
            }
          }

          setStudents(parsedStudents);
          toast.success(`Tải thành công ${parsedStudents.length} sinh viên!`);
        } catch (error) {
          toast.error('Lỗi xử lý file Excel!');
        }
      };
      reader.readAsText(file);
    } finally {
      setIsUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher || !classId || !sessionName.trim()) return;

    const sessionCode = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newSession: AttendanceSession = {
      id: crypto.randomUUID(),
      classId,
      teacherId: teacher.id,
      sessionCode,
      sessionName: sessionName.trim(),
      startTime: new Date().toISOString(),
      endTime: null,
      isActive: true,
      students: students.length > 0 ? students : undefined,
      createdAt: new Date().toISOString(),
    };

    saveSession(newSession);
    loadData();
    setIsDialogOpen(false);
    setSessionName('');
    setStudents([]);
    toast.success('Tạo phiên điểm danh thành công!');
    navigate(`/session/${newSession.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!classData) {
    return null;
  }

  const totalStudents = sessions.reduce((sum, session) => {
    const records = getRecordsBySessionId(session.id);
    return sum + records.length;
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')} 
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại Dashboard
          </Button>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{classData.className}</h1>
              <div className="flex items-center space-x-4 mt-3 flex-wrap">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700">
                  {classData.classCode}
                </span>
                <span className="text-gray-600">
                  Tạo: {format(new Date(classData.createdAt), 'dd MMM yyyy', { locale: vi })}
                </span>
                {classData.location && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                    <MapPin className="h-3.5 w-3.5 mr-1.5" />
                    GPS: {classData.location.latitude.toFixed(4)}, {classData.location.longitude.toFixed(4)}
                  </span>
                )}
              </div>
              {classData.description && (
                <p className="text-gray-600 mt-2 text-base">{classData.description}</p>
              )}
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all">
                  <Plus className="h-5 w-5 mr-2" />
                  <span>Tạo Phiên Điểm Danh</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Tạo Phiên Điểm Danh Mới</DialogTitle>
                  <DialogDescription>Nhập tên buổi học và tải danh sách sinh viên (Excel)</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateSession} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="session-name" className="text-base font-semibold">Tên Buổi Học</Label>
                    <Input
                      id="session-name"
                      placeholder="Ví dụ: Buổi 1 - Giới thiệu môn học"
                      value={sessionName}
                      onChange={(e) => setSessionName(e.target.value)}
                      className="h-10"
                      autoFocus
                      required
                    />
                  </div>

                  {/* File Upload Section */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Tải Danh Sách Sinh Viên (CSV/Excel)
                    </Label>
                    <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-indigo-400 transition cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-700 mb-1">Click để chọn file hoặc kéo thả</p>
                      <p className="text-xs text-slate-500">CSV hoặc Excel (.csv, .xlsx)</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileUpload}
                        disabled={isUploadingFile}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* File Info */}
                  {students.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-green-900">✓ Đã tải {students.length} sinh viên</p>
                      <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                        {students.slice(0, 5).map((student) => (
                          <p key={student.id} className="text-xs text-green-700">
                            • {student.name} ({student.studentId})
                          </p>
                        ))}
                        {students.length > 5 && (
                          <p className="text-xs text-green-700 italic">... và {students.length - 5} sinh viên khác</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Upload Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-blue-900 mb-2">Format file Excel:</p>
                    <div className="text-xs text-blue-700 space-y-1">
                      <p>• Cột 1: Tên (Name / Tên)</p>
                      <p>• Cột 2: Mã SV (ID / Mã)</p>
                      <p>• Cột 3: Email (tùy chọn)</p>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-10">
                    Tạo & Hiển Thị QR
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Stats */}
      {sessions.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Tổng Phiên</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{sessions.length}</p>
                  </div>
                  <QrCode className="h-12 w-12 text-indigo-100" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Phiên Đang Hoạt Động</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">
                      {sessions.filter(s => s.isActive).length}
                    </p>
                  </div>
                  <CheckCircle className="h-12 w-12 text-green-100" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Sinh Viên Đã Điểm Danh</p>
                    <p className="text-3xl font-bold text-indigo-600 mt-1">{totalStudents}</p>
                  </div>
                  <Users className="h-12 w-12 text-indigo-100" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
            Lịch Sử Phiên Điểm Danh
          </h2>
        </div>

        {sessions.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12 text-center">
              <QrCode className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có phiên điểm danh nào</h3>
              <p className="text-gray-500 mb-6">Tạo phiên điểm danh đầu tiên để sinh viên có thể quét QR code</p>
              <Button 
                onClick={() => setIsDialogOpen(true)} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tạo Phiên Đầu Tiên
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {sessions.map((session) => {
              const records = getRecordsBySessionId(session.id);
              return (
                <Card
                  key={session.id}
                  className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer bg-white"
                  onClick={() => navigate(`/session/${session.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-gray-900">{session.sessionName}</CardTitle>
                        <CardDescription className="flex items-center space-x-4 mt-2">
                          <span className="flex items-center text-gray-600">
                            <Clock className="h-4 w-4 mr-1.5 text-indigo-600" />
                            {format(new Date(session.startTime), 'dd/MM/yyyy HH:mm', { locale: vi })}
                          </span>
                          <span className="text-gray-600">
                            {records.length} sinh viên
                          </span>
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        {session.isActive ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                            <span className="w-2 h-2 bg-green-600 rounded-full mr-1.5"></span>
                            Đang hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                            <span className="w-2 h-2 bg-gray-600 rounded-full mr-1.5"></span>
                            Đã kết thúc
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}