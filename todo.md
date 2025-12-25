# Ứng Dụng Điểm Danh Sinh Viên Web3 - Kế Hoạch Phát Triển

## Hướng Dẫn Thiết Kế

### Tham Khảo Thiết Kế

- **Google Classroom**: Giao diện sạch sẽ, dễ sử dụng
- **Microsoft Teams**: Dashboard chuyên nghiệp
- **Phong cách**: Modern Education + Clean UI + Professional

### Bảng Màu

- Primary: #4F46E5 (Indigo - nút chính, header)
- Secondary: #10B981 (Green - trạng thái thành công)
- Background: #F9FAFB (Light Gray - nền)
- Card: #FFFFFF (White - thẻ nội dung)
- Text: #111827 (Dark Gray), #6B7280 (Medium Gray - text phụ)
- Accent: #EF4444 (Red - cảnh báo, nút xóa)

### Typography

- Heading1: Inter font-weight 700 (32px)
- Heading2: Inter font-weight 600 (24px)
- Heading3: Inter font-weight 600 (18px)
- Body: Inter font-weight 400 (14px)
- Button: Inter font-weight 600 (14px)

### Các Component Chính

- **Buttons**: Primary (indigo bg), Secondary (white bg + border), Danger (red bg)
- **Cards**: White background, subtle shadow, 8px rounded
- **Forms**: Clean inputs với focus ring indigo
- **QR Code**: Large display với border và shadow

### Layout & Spacing

- Dashboard: Sidebar navigation + main content area
- Card spacing: 16px gaps trong grid
- Section padding: 24px vertical
- Responsive: Mobile-first approach

---

## Nhiệm Vụ Phát Triển

### 1. Cấu Trúc & Setup

- Cài đặt dependencies: qrcode.react, date-fns
- Tạo cấu trúc thư mục components, pages, lib, types

### 2. Quản Lý State & Storage

- Tạo localStorage helpers cho classes, sessions, records
- Tạo custom hooks: useAuth, useClasses, useSessions, useAttendance
- Tạo context cho authentication

### 3. Authentication (localStorage)

- Trang đăng nhập/đăng ký giáo viên
- Form validation
- Session management với localStorage

### 4. Dashboard Giáo Viên

- Sidebar navigation
- Danh sách lớp học (grid cards)
- Nút tạo lớp mới
- Thống kê tổng quan

### 5. Quản Lý Lớp Học

- Trang chi tiết lớp học
- Danh sách phiên điểm danh
- Nút tạo phiên điểm danh mới
- Xem lịch sử điểm danh

### 6. Tạo & Hiển Thị QR Code

- Modal tạo phiên điểm danh
- Generate QR code với session ID
- Hiển thị QR toàn màn hình
- Countdown timer cho phiên
- Nút đóng phiên

### 7. Trang Sinh Viên (Quét QR)

- Trang public không cần đăng nhập
- Nhập mã session (từ QR hoặc thủ công)
- Form điểm danh: Họ tên, MSSV, Email
- Validation và submit
- Thông báo thành công/lỗi

### 8. Danh Sách Điểm Danh Real-time

- Component hiển thị danh sách sinh viên đã điểm danh
- Auto-refresh mỗi 3 giây
- Hiển thị thời gian điểm danh
- Export to CSV

### 9. Báo Cáo & Thống Kê

- Trang báo cáo tổng hợp
- Biểu đồ tỷ lệ điểm danh
- Filter theo lớp, thời gian
- Export dữ liệu

### 10. Responsive & Polish

- Mobile responsive cho tất cả trang
- Loading states
- Error handling
- Toast notifications
- Animations mượt mà

### 11. Testing & Build

- Test các luồng chính
- Fix bugs
- Run lint
- Build production
