import { useState } from 'react';
import { ArrowLeft, MapPin, Clock, Users, Share2, Heart, CheckCircle, AlertCircle, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function EventDetail() {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);

  // Mock data
  const event = {
    id: '1',
    title: 'Khóa học Web3 & Blockchain',
    subtitle: 'Từ cơ bản đến nâng cao',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop',
    date: 'Friday, December 19',
    time: '5:45 PM - 8:30 PM',
    location: 'Trường Đại học Công nghệ - TP.HCM',
    locationShort: 'Tân Phú, Thành phố Hồ Chí Minh',
    description: 'Khóa học chuyên sâu về Web3, Blockchain và các ứng dụng thực tế. Bạn sẽ học cách xây dựng smart contracts, tích hợp wallet và phát triển dApps.',
    registered: 245,
    capacity: 500,
    status: 'past',
    hosts: [
      { id: '1', name: 'Nguyễn Văn A', role: 'Lecturer', color: 'from-blue-400 to-cyan-400' },
      { id: '2', name: 'Trần Thị B', role: 'Co-Lecturer', color: 'from-purple-400 to-pink-400' },
      { id: '3', name: 'Lê Văn C', role: 'Assistant', color: 'from-orange-400 to-red-400' },
    ],
    attendees: 68,
    sections: [
      { title: 'Introduction to Blockchain', duration: '1h 30m', icon: '🔗' },
      { title: 'Smart Contracts Basics', duration: '2h', icon: '⚙️' },
      { title: 'Web3 Integration', duration: '1h 30m', icon: '🌐' },
      { title: 'Hands-on Workshop', duration: '2h', icon: '🛠️' },
    ],
  };

  const isPastEvent = event.status === 'past';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header Navigation */}
      <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-700 rounded-lg transition text-slate-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-slate-100 flex-1 ml-4">{event.title}</h1>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-slate-700 rounded-lg transition text-slate-300">
              <Share2 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsLiked(!isLiked)}
              className="p-2 hover:bg-slate-700 rounded-lg transition"
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-slate-300'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-2">{event.title}</h2>
            <p className="text-xl text-slate-300">{event.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Status Alert */}
        {isPastEvent && (
          <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 backdrop-blur flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-300">Sự kiện đã kết thúc</h3>
              <p className="text-sm text-amber-200/80 mt-1">Sự kiện này đã diễn ra 5 ngày trước. Bạn có thể xem thông tin chi tiết và đánh giá.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Event Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Info */}
            <div className="grid grid-cols-3 gap-4">
              {/* Date */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300" />
                <div className="relative bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-slate-600 transition">
                  <Clock className="h-6 w-6 text-cyan-400 mb-2" />
                  <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Ngày & Giờ</p>
                  <p className="text-sm text-slate-200 font-medium">{event.date}</p>
                  <p className="text-xs text-slate-400 mt-1">{event.time}</p>
                </div>
              </div>

              {/* Location */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300" />
                <div className="relative bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-slate-600 transition">
                  <MapPin className="h-6 w-6 text-emerald-400 mb-2" />
                  <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Địa điểm</p>
                  <p className="text-sm text-slate-200 font-medium line-clamp-2">{event.location}</p>
                </div>
              </div>

              {/* Participants */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300" />
                <div className="relative bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-slate-600 transition">
                  <Users className="h-6 w-6 text-purple-400 mb-2" />
                  <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Đã đăng ký</p>
                  <p className="text-sm text-slate-200 font-medium">{event.registered}/{event.capacity}</p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-slate-200">Tỷ lệ đăng ký</span>
                <span className="text-sm text-slate-400">{Math.round((event.registered / event.capacity) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                />
              </div>
            </div>

            {/* Course Sections */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-cyan-400" />
                Nội dung khóa học
              </h3>
              <div className="space-y-3">
                {event.sections.map((section, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition border border-slate-600/50"
                  >
                    <span className="text-2xl flex-shrink-0">{section.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-200">{section.title}</p>
                      <p className="text-xs text-slate-400 mt-1">⏱️ {section.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-slate-100 mb-4">Mô tả chi tiết</h3>
              <p className="text-slate-300 leading-relaxed mb-4">{event.description}</p>
              <p className="text-slate-400 text-sm">
                🎯 Khóa học này phù hợp cho những ai muốn bắt đầu hành trình với Web3 và blockchain, từ cơ bản đến thực hành thực tế.
              </p>
            </div>
          </div>

          {/* Right Column - Hosts & Action */}
          <div className="space-y-6">
            {/* Sticky Action Button */}
            <div className="sticky top-20 space-y-4">
              {!isPastEvent && (
                <Button className="w-full h-12 text-base bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition">
                  Đăng Ký Tham Dự
                </Button>
              )}

              {isPastEvent && (
                <Button className="w-full h-12 text-base bg-slate-700 hover:bg-slate-600" disabled>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Sự kiện đã kết thúc
                </Button>
              )}

              {/* Hosts Section */}
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-sm font-bold text-slate-100 uppercase mb-4 tracking-wider">Giảng viên</h3>
                <div className="space-y-3">
                  {event.hosts.map((host) => (
                    <div key={host.id} className="group">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition border border-slate-600/50 group-hover:border-slate-500 cursor-pointer">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${host.color} flex items-center justify-center text-lg font-bold flex-shrink-0`}>
                          {host.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-100">{host.name}</p>
                          <p className="text-xs text-slate-400">{host.role}</p>
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-300 transition">
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attendees Preview */}
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-sm font-bold text-slate-100 uppercase mb-4 tracking-wider">Người tham dự</h3>
                <div className="flex -space-x-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 border-2 border-slate-800 flex items-center justify-center text-xs font-bold text-white hover:scale-110 transition cursor-pointer"
                      title={`Người tham dự ${i + 1}`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-300">
                  <span className="font-semibold text-cyan-400">{event.attendees}</span> người đang theo dõi
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  và <span className="font-semibold">{event.registered - event.attendees}</span> người khác
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <p className="text-slate-400 text-sm">© 2025 Proofly. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-slate-400 hover:text-slate-200 transition">Privacy</a>
            <a href="#" className="text-slate-400 hover:text-slate-200 transition">Terms</a>
            <a href="#" className="text-slate-400 hover:text-slate-200 transition">Contact</a>
          </div>
        </div>
      </div>
    </div>
  );
}
