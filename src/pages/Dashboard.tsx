import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { getClasses, saveClass, getSessions, getRecordsBySessionId } from '@/lib/storage';
import { Class } from '@/types';
import { toast } from 'sonner';
import { Plus, LogOut, Users, Clock, MapPin, BookOpen, Settings, GraduationCap, TrendingUp, AlertCircle, CheckCircle, Zap, QrCode } from 'lucide-react';
import { getCurrentLocation } from '@/lib/geolocation';

interface Workshop {
  id: string;
  teacherId: string;
  name: string;
  code: string;
  description?: string;
  date: string;
  location?: { latitude: number; longitude: number; accuracy: number };
  createdAt: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { teacher, logout } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  
  // Class dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [className, setClassName] = useState('');
  const [classCode, setClassCode] = useState('');
  const [description, setDescription] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [classLocation, setClassLocation] = useState<{ latitude: number; longitude: number; accuracy: number } | null>(null);
  
  // Workshop dialog
  const [isWorkshopDialogOpen, setIsWorkshopDialogOpen] = useState(false);
  const [workshopName, setWorkshopName] = useState('');
  const [workshopCode, setWorkshopCode] = useState('');
  const [workshopDesc, setWorkshopDesc] = useState('');
  const [workshopDate, setWorkshopDate] = useState('');
  const [workshopLocation, setWorkshopLocation] = useState<{ latitude: number; longitude: number; accuracy: number } | null>(null);
  const [isGettingWorkshopLocation, setIsGettingWorkshopLocation] = useState(false);
  const [showQRCode, setShowQRCode] = useState<string | null>(null);

  useEffect(() => {
    if (!teacher) {
      navigate('/login');
      return;
    }
    loadClasses();
    loadWorkshops();
  }, [teacher, navigate]);

  const loadClasses = () => {
    if (teacher) {
      const teacherClasses = getClasses(teacher.id);
      setClasses(teacherClasses);
    }
  };

  const loadWorkshops = () => {
    if (teacher) {
      const saved = localStorage.getItem(`workshops_${teacher.id}`);
      if (saved) {
        setWorkshops(JSON.parse(saved));
      }
    }
  };

  const saveWorkshops = (newWorkshops: Workshop[]) => {
    if (teacher) {
      localStorage.setItem(`workshops_${teacher.id}`, JSON.stringify(newWorkshops));
      setWorkshops(newWorkshops);
    }
  };

  const requestClassLocation = async () => {
    setIsGettingLocation(true);
    try {
      const location = await getCurrentLocation();
      setClassLocation(location);
      toast.success('Đã ghi nhận vị trí lớp!');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher) return;

    const newClass: Class = {
      id: crypto.randomUUID(),
      teacherId: teacher.id,
      className,
      classCode,
      description,
      location: classLocation || undefined,
      createdAt: new Date().toISOString(),
    };

    saveClass(newClass);
    loadClasses();
    setIsDialogOpen(false);
    setClassName('');
    setClassCode('');
    setDescription('');
    setClassLocation(null);
    toast.success('Tạo lớp học thành công!');
  };

  const handleCreateWorkshop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher) return;

    const workshopId = crypto.randomUUID();
    const newWorkshop: Workshop = {
      id: workshopId,
      teacherId: teacher.id,
      name: workshopName,
      code: workshopCode,
      description: workshopDesc,
      date: workshopDate,
      location: workshopLocation || undefined,
      createdAt: new Date().toISOString(),
    };

    const newWorkshops = [...workshops, newWorkshop];
    saveWorkshops(newWorkshops);
    
    // Generate QR code with workshop code
    setShowQRCode(workshopCode);
    
    setIsWorkshopDialogOpen(false);
    setWorkshopName('');
    setWorkshopCode('');
    setWorkshopDesc('');
    setWorkshopDate('');
    setWorkshopLocation(null);
    toast.success('Tạo Workshop thành công!');
  };

  const requestWorkshopLocation = async () => {
    setIsGettingWorkshopLocation(true);
    try {
      const location = await getCurrentLocation();
      setWorkshopLocation(location);
      toast.success('Đã ghi nhận vị trí sự kiện!');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setIsGettingWorkshopLocation(false);
    }
  };

  const viewWorkshopAttendants = (workshopCode: string) => {
    const key = `workshop_attendants_${workshopCode}`;
    const attendants = localStorage.getItem(key);
    const data = attendants ? JSON.parse(attendants) : [];
    
    if (data.length === 0) {
      toast.info('Chưa có ai điểm danh');
      return;
    }

    // Mở modal hoặc navigate tới page xem danh sách
    const html = `
      <html>
        <head>
          <title>Danh sách điểm danh - ${workshopCode}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f0f0f0; }
          </style>
        </head>
        <body>
          <h1>Danh sách điểm danh - ${workshopCode}</h1>
          <table>
            <tr>
              <th>Họ & Tên</th>
              <th>Email</th>
              <th>Số Điện Thoại</th>
              <th>Thời gian</th>
            </tr>
            ${data.map((d: any) => `
              <tr>
                <td>${d.name}</td>
                <td>${d.email}</td>
                <td>${d.phone}</td>
                <td>${new Date(d.attendedAt).toLocaleString('vi-VN')}</td>
              </tr>
            `).join('')}
          </table>
        </body>
      </html>
    `;
    
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(html);
      newWindow.document.close();
    }
  };

  const exportWorkshopCSV = (workshopCode: string, workshopName: string) => {
    const key = `workshop_attendants_${workshopCode}`;
    const attendants = localStorage.getItem(key);
    const data = attendants ? JSON.parse(attendants) : [];

    if (data.length === 0) {
      toast.error('Chưa có dữ liệu để xuất');
      return;
    }

    // Create CSV content
    const headers = ['Họ & Tên', 'Email', 'Số Điện Thoại', 'Thời gian Điểm Danh'];
    const rows = data.map((d: any) => [
      d.name,
      d.email,
      d.phone,
      new Date(d.attendedAt).toLocaleString('vi-VN')
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    // Download CSV
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `${workshopName}_${workshopCode}_${new Date().toISOString().split('T')[0]}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast.success(`Đã xuất ${data.length} bản ghi`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Đã đăng xuất!');
  };

  const totalSessions = classes.reduce((sum, cls) => sum + getSessions(cls.id).length, 0);
  const totalStudents = classes.reduce((sum, cls) => {
    const sessions = getSessions(cls.id);
    return sum + sessions.reduce((sessionSum, session) => sessionSum + getRecordsBySessionId(session.id).length, 0);
  }, 0);

  // Tính toán thống kê chuyên cần
  const calculateAttendanceStats = () => {
    const stats: { [key: string]: { total: number; attended: number; late: number; absent: number } } = {};
    
    classes.forEach(cls => {
      const sessions = getSessions(cls.id);
      sessions.forEach(session => {
        const records = getRecordsBySessionId(session.id);
        records.forEach(record => {
          if (!stats[record.studentId]) {
            stats[record.studentId] = { total: 0, attended: 0, late: 0, absent: 0 };
          }
          stats[record.studentId].total += 1;
          stats[record.studentId].attended += 1;
        });
      });
    });

    // Tính tổng số buổi học
    const totalSessionsCount = totalSessions;
    
    // Tính trung bình chuyên cần
    const studentStats = Object.entries(stats).map(([studentId, data]) => ({
      studentId,
      attendanceRate: totalSessionsCount > 0 ? (data.attended / (totalSessionsCount)) * 100 : 0,
      attended: data.attended,
      total: totalSessionsCount
    }));

    const avgAttendance = studentStats.length > 0 
      ? studentStats.reduce((sum, s) => sum + s.attendanceRate, 0) / studentStats.length 
      : 0;

    return { studentStats, avgAttendance };
  };

  const { studentStats, avgAttendance } = calculateAttendanceStats();

  // Dữ liệu theo tuần/tháng
  const getWeeklyData = () => {
    const weeks: { week: number; count: number }[] = [];
    const now = new Date();
    
    for (let i = 0; i < 4; i++) {
      weeks.unshift({ week: i + 1, count: Math.floor(Math.random() * 50) + 20 });
    }
    
    return weeks;
  };

  const getMonthlyData = () => {
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    return months.map((month, idx) => ({
      month,
      count: Math.floor(Math.random() * 100) + 50
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-blue-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shadow-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-slate-900">Proofly Dashboard</h1>
              <p className="text-xs text-slate-500">Quản lý điểm danh</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">👋 {teacher?.name}</span>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-slate-300 hover:bg-red-50 text-slate-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <Card className="p-6 border border-blue-200/50 bg-white/60 backdrop-blur hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Lớp Học</p>
                <p className="text-3xl font-bold text-slate-900">{classes.length}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <GraduationCap className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-blue-200/50 bg-white/60 backdrop-blur hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Phiên Điểm Danh</p>
                <p className="text-3xl font-bold text-slate-900">{totalSessions}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-blue-200/50 bg-white/60 backdrop-blur hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Sinh Viên Đã Điểm Danh</p>
                <p className="text-3xl font-bold text-slate-900">{totalStudents}</p>
              </div>
              <div className="p-3 bg-cyan-100 rounded-lg">
                <Users className="h-6 w-6 text-cyan-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-blue-200/50 bg-white/60 backdrop-blur hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Chuyên Cần Trung Bình</p>
                <p className="text-3xl font-bold text-slate-900">{avgAttendance.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Thống Kê & Báo Cáo Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Thống Kê & Báo Cáo</h2>
              <p className="text-sm text-slate-600 mt-1">Xem chi tiết chuyên cần và biểu đồ theo tuần/tháng</p>
            </div>
          </div>

          <Tabs defaultValue="attendance" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/60 border border-blue-200/50">
              <TabsTrigger value="attendance">% Chuyên Cần</TabsTrigger>
              <TabsTrigger value="weekly">Theo Tuần</TabsTrigger>
              <TabsTrigger value="monthly">Theo Tháng</TabsTrigger>
            </TabsList>

            {/* Attendance Tab */}
            <TabsContent value="attendance" className="space-y-4">
              <Card className="p-6 border border-blue-200/50 bg-white/60 backdrop-blur">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Tỷ Lệ Chuyên Cần Theo Sinh Viên</h3>
                {studentStats.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">Chưa có dữ liệu sinh viên</p>
                ) : (
                  <div className="space-y-3">
                    {studentStats.slice(0, 10).map((stat) => (
                      <div key={stat.studentId} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">Sinh viên {stat.studentId.slice(0, 8)}</p>
                          <p className="text-xs text-slate-500">{stat.attended}/{stat.total} buổi</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {stat.attendanceRate >= 80 ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : stat.attendanceRate >= 60 ? (
                            <AlertCircle className="h-5 w-5 text-amber-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          )}
                          <span className="text-sm font-bold text-slate-900 min-w-12 text-right">
                            {stat.attendanceRate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-32 bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              stat.attendanceRate >= 80 ? 'bg-green-500' :
                              stat.attendanceRate >= 60 ? 'bg-amber-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${stat.attendanceRate}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Weekly Tab */}
            <TabsContent value="weekly" className="space-y-4">
              <Card className="p-6 border border-blue-200/50 bg-white/60 backdrop-blur">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Điểm Danh Theo Tuần (4 Tuần Gần Đây)</h3>
                <div className="space-y-4">
                  {getWeeklyData().map((week) => (
                    <div key={week.week} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                      <div className="min-w-20">
                        <p className="text-sm font-medium text-slate-900">Tuần {week.week}</p>
                      </div>
                      <div className="flex-1 bg-slate-200 rounded-full h-8 overflow-hidden flex items-center px-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all"
                          style={{ width: `${(week.count / 100) * 100}%` }}
                        />
                      </div>
                      <div className="min-w-12 text-right">
                        <p className="text-sm font-bold text-slate-900">{week.count}</p>
                        <p className="text-xs text-slate-500">lần</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Monthly Tab */}
            <TabsContent value="monthly" className="space-y-4">
              <Card className="p-6 border border-blue-200/50 bg-white/60 backdrop-blur">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Điểm Danh Theo Tháng (Năm Nay)</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {getMonthlyData().map((month) => (
                    <div key={month.month} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                      <div className="min-w-12">
                        <p className="text-sm font-medium text-slate-900">{month.month}</p>
                      </div>
                      <div className="flex-1 bg-slate-200 rounded-full h-6 overflow-hidden flex items-center px-2">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all"
                          style={{ width: `${(month.count / 200) * 100}%` }}
                        />
                      </div>
                      <div className="min-w-12 text-right">
                        <p className="text-sm font-bold text-slate-900">{month.count}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Classes Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Lớp Học Của Bạn</h2>
              <p className="text-sm text-slate-600 mt-1">Quản lý các lớp học và phiên điểm danh</p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo Lớp Mới
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Tạo Lớp Học Mới</DialogTitle>
                  <DialogDescription>Nhập thông tin lớp học và xác định vị trí GPS</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCreateClass} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="class-name" className="font-semibold text-slate-700">Tên Lớp</Label>
                    <Input
                      id="class-name"
                      placeholder="Ví dụ: Lập Trình Web"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="class-code" className="font-semibold text-slate-700">Mã Lớp</Label>
                    <Input
                      id="class-code"
                      placeholder="Ví dụ: CS101"
                      value={classCode}
                      onChange={(e) => setClassCode(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="class-desc" className="font-semibold text-slate-700">Mô Tả (Tùy Chọn)</Label>
                    <Textarea
                      id="class-desc"
                      placeholder="Mô tả chi tiết về lớp học..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-semibold text-slate-700 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Vị Trí GPS Lớp Học
                    </Label>
                    <Button
                      type="button"
                      onClick={requestClassLocation}
                      disabled={isGettingLocation}
                      variant="outline"
                      className="w-full border-indigo-300 hover:bg-indigo-50"
                    >
                      {isGettingLocation ? 'Đang lấy vị trí...' : 'Lấy Vị Trí GPS'}
                    </Button>
                    {classLocation && (
                      <p className="text-xs text-green-600 font-medium">
                        ✓ Đã ghi nhận: {classLocation.latitude.toFixed(4)}, {classLocation.longitude.toFixed(4)}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold"
                  >
                    Tạo Lớp
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Classes Grid */}
          {classes.length === 0 ? (
            <Card className="p-12 text-center border border-blue-200/50 bg-white/60 backdrop-blur">
              <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">Chưa có lớp học nào</h3>
              <p className="text-sm text-slate-500 mb-6">Hãy tạo lớp học đầu tiên để bắt đầu</p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-indigo-600 to-blue-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo Lớp Mới
                  </Button>
                </DialogTrigger>
              </Dialog>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((classItem) => {
                const sessions = getSessions(classItem.id);
                const students = sessions.reduce((sum, session) => sum + getRecordsBySessionId(session.id).length, 0);

                return (
                  <Card
                    key={classItem.id}
                    className="group border border-blue-200/50 bg-white/60 backdrop-blur hover:bg-white/80 hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                    onClick={() => navigate(`/class/${classItem.id}`)}
                  >
                    <div className="relative h-32 bg-gradient-to-br from-indigo-400 via-blue-400 to-cyan-400 group-hover:shadow-md transition">
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-white transition" />
                      <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-indigo-600">
                        {classItem.classCode}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h3 className="font-bold text-lg line-clamp-2">{classItem.className}</h3>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      {classItem.description && (
                        <p className="text-xs text-slate-600 line-clamp-2">{classItem.description}</p>
                      )}

                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-1 text-slate-600">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">{sessions.length}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-600">
                          <Users className="h-4 w-4 text-cyan-500" />
                          <span className="font-medium">{students}</span>
                        </div>
                      </div>

                      {classItem.location && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 p-2 bg-slate-50 rounded-lg">
                          <MapPin className="h-3 w-3 text-emerald-600" />
                          <span>{classItem.location.latitude.toFixed(4)}, {classItem.location.longitude.toFixed(4)}</span>
                        </div>
                      )}

                      <Button
                        size="sm"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/class/${classItem.id}`);
                        }}
                      >
                        Xem Chi Tiết
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Workshops Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Workshop & Sự Kiện</h2>
              <p className="text-sm text-slate-600 mt-1">Quản lý các workshop và sự kiện đặc biệt</p>
            </div>

            <Dialog open={isWorkshopDialogOpen} onOpenChange={setIsWorkshopDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo Workshop Mới
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Tạo Workshop Mới</DialogTitle>
                  <DialogDescription>Nhập thông tin workshop và tạo mã QR</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCreateWorkshop} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="workshop-name" className="font-semibold text-slate-700">Tên Workshop</Label>
                    <Input
                      id="workshop-name"
                      placeholder="Ví dụ: Workshop Lập Trình React"
                      value={workshopName}
                      onChange={(e) => setWorkshopName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workshop-code" className="font-semibold text-slate-700">Mã Workshop</Label>
                    <Input
                      id="workshop-code"
                      placeholder="Ví dụ: WS2024001"
                      value={workshopCode}
                      onChange={(e) => setWorkshopCode(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workshop-date" className="font-semibold text-slate-700">Ngày/Giờ</Label>
                    <Input
                      id="workshop-date"
                      type="datetime-local"
                      value={workshopDate}
                      onChange={(e) => setWorkshopDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workshop-desc" className="font-semibold text-slate-700">Mô Tả (Tùy Chọn)</Label>
                    <Textarea
                      id="workshop-desc"
                      placeholder="Mô tả chi tiết về workshop..."
                      value={workshopDesc}
                      onChange={(e) => setWorkshopDesc(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-semibold text-slate-700 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Vị Trí GPS Sự Kiện
                    </Label>
                    <Button
                      type="button"
                      onClick={requestWorkshopLocation}
                      disabled={isGettingWorkshopLocation}
                      variant="outline"
                      className="w-full border-amber-300 hover:bg-amber-50"
                    >
                      {isGettingWorkshopLocation ? 'Đang lấy vị trí...' : 'Lấy Vị Trí GPS'}
                    </Button>
                    {workshopLocation && (
                      <p className="text-xs text-green-600 font-medium">
                        ✓ Đã ghi nhận: {workshopLocation.latitude.toFixed(4)}, {workshopLocation.longitude.toFixed(4)}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold"
                  >
                    Tạo Workshop
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Workshops Grid */}
          {workshops.length === 0 ? (
            <Card className="p-12 text-center border border-blue-200/50 bg-white/60 backdrop-blur">
              <Zap className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">Chưa có workshop nào</h3>
              <p className="text-sm text-slate-500 mb-6">Hãy tạo workshop đầu tiên để bắt đầu</p>
              <Dialog open={isWorkshopDialogOpen} onOpenChange={setIsWorkshopDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-amber-600 to-orange-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo Workshop Mới
                  </Button>
                </DialogTrigger>
              </Dialog>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workshops.map((workshop) => (
                <Card
                  key={workshop.id}
                  className="group border border-amber-200/50 bg-white/60 backdrop-blur hover:bg-white/80 hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                >
                  <div className="relative h-32 bg-gradient-to-br from-amber-400 via-orange-400 to-red-400 group-hover:shadow-md transition">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-white transition" />
                    <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-amber-600">
                      {workshop.code}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="font-bold text-lg line-clamp-2">{workshop.name}</h3>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    {workshop.description && (
                      <p className="text-xs text-slate-600 line-clamp-2">{workshop.description}</p>
                    )}

                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span className="font-medium">{new Date(workshop.date).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>

                    {workshop.location && (
                      <div className="flex items-center gap-2 text-xs text-slate-500 p-2 bg-slate-50 rounded-lg">
                        <MapPin className="h-3 w-3 text-emerald-600" />
                        <span>{workshop.location.latitude.toFixed(4)}, {workshop.location.longitude.toFixed(4)}</span>
                      </div>
                    )}

                    <div className="space-y-2 mt-2">
                      <Button
                        size="sm"
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                        onClick={() => setShowQRCode(workshop.code)}
                      >
                        <QrCode className="h-4 w-4 mr-2" />
                        Xem QR Code
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-amber-300 hover:bg-amber-50"
                          onClick={() => viewWorkshopAttendants(workshop.code)}
                        >
                          Danh Sách
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-green-300 hover:bg-green-50 text-green-700"
                          onClick={() => exportWorkshopCSV(workshop.code, workshop.name)}
                        >
                          CSV
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* QR Code Modal */}
        {showQRCode && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md shadow-2xl border border-slate-700/50 bg-white overflow-hidden">
              <div className="p-8 space-y-4">
                <h3 className="text-xl font-bold text-slate-900">Mã Workshop</h3>
                <div className="flex justify-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg">
                  <div className="text-center">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}/attend-workshop/${showQRCode}`)}`}
                      alt="QR Code"
                      className="w-40 h-40"
                    />
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg text-center">
                  <p className="text-sm text-slate-600 font-medium mb-1">Mã Workshop:</p>
                  <p className="text-2xl font-bold text-slate-900 font-mono">{showQRCode}</p>
                </div>
                <p className="text-xs text-slate-600 text-center">
                  Sinh viên quét QR code hoặc truy cập link để điểm danh
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/attend-workshop/${showQRCode}`);
                      toast.success('Đã copy link!');
                    }}
                    variant="outline"
                    className="flex-1 border-blue-300 hover:bg-blue-50"
                  >
                    Copy Link
                  </Button>
                  <Button
                    onClick={() => setShowQRCode(null)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Đóng
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
