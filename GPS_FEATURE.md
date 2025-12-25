# 🌍 Tính Năng Định Vị GPS - Hệ Thống Điểm Danh

## Tổng Quan

Hệ thống đã được tích hợp tính năng **GPS Location Tracking** để xác minh sinh viên điểm danh tại đúng địa điểm lớp học. Điều này nâng cao chất lượng của hệ thống và giảm thiểu gian lận.

---

## 🚀 Các Tính Năng

### 1. **Ghi Nhận Vị Trí Lớp Học** (Giáo Viên)
- Giáo viên ghi nhận GPS của lớp học khi tạo lớp mới
- Lưu trữ: latitude, longitude, accuracy
- Có thể cập nhật lại vị trí bất kỳ lúc nào

### 2. **Lấy GPS Sinh Viên** (Sinh Viên)
- Sinh viên điểm danh phải cấp quyền GPS cho trình duyệt
- Hệ thống tự động lấy vị trí hiện tại
- Hiển thị tọa độ & độ chính xác

### 3. **Tính Khoảng Cách**
- Tính khoảng cách giữa sinh viên và lớp học
- Sử dụng công thức Haversine (tính toán đúng trên bề mặt quả đất)
- Hiển thị khoảng cách (mét hoặc km)

### 4. **Xác Minh Vị Trí** (Tùy Chọn)
- Kiểm tra xem sinh viên có trong phạm vi lớp không
- Mặc định phạm vi: 1km
- Báo cáo vị trí ngoài phạm vi (orange/warning color)

### 5. **Hiển Thị Trên Dashboard**
- SessionView hiển thị GPS của mỗi sinh viên
- Hiển thị tọa độ & khoảng cách
- Color-coded: Green (OK) / Orange (quá xa)

---

## 📱 Hướng Dẫn Sử Dụng

### Cho Giáo Viên:

#### 1. Tạo Lớp Học Mới
```
1. Vào Dashboard → Click "Tạo Lớp Mới"
2. Nhập thông tin lớp:
   - Tên Lớp Học
   - Mã Lớp
   - Mô Tả (tùy chọn)
3. Phần "Vị Trí Lớp Học":
   - Click nút "Lấy Vị Trí GPS"
   - Chấp nhận quyền truy cập GPS
   - Hệ thống sẽ lưu vị trí
4. Click "Tạo Lớp"
```

#### 2. Xem Danh Sách Sinh Viên
```
1. Vào lớp học → Tạo phiên điểm danh
2. Mở phiên → Xem "Danh Sách Điểm Danh"
3. Trong bảng, cột "Vị Trí GPS" sẽ hiển thị:
   - Tọa độ GPS của sinh viên
   - Khoảng cách từ lớp
   - Màu sắc: Green (OK), Orange (quá xa)
4. Export CSV (bao gồm cả GPS data)
```

---

### Cho Sinh Viên:

#### 1. Điểm Danh Bằng QR Code
```
1. Quét QR code từ giáo viên (hoặc nhập mã thủ công)
2. Nhập thông tin:
   - Họ và Tên
   - Mã Số Sinh Viên
   - Email
3. **Lấy Vị Trí GPS**:
   - Click nút "Lấy Vị Trí GPS"
   - Cho phép trình duyệt truy cập GPS
   - Chờ hệ thống lấy vị trí (2-5 giây)
   - Nếu có vị trí lớp, sẽ hiển thị khoảng cách
4. Click "Xác Nhận Điểm Danh"
5. Nhận thông báo xác nhận
```

#### 2. Lỗi GPS Phổ Biến

| Lỗi | Nguyên Nhân | Giải Pháp |
|-----|-----------|---------|
| "Bạn đã từ chối quyền" | Từ chối GPS | Cấp quyền GPS trong cài đặt trình duyệt |
| "Không thể lấy vị trí" | GPS tắt | Bật GPS trên thiết bị |
| "Hết thời gian chờ" | Tín hiệu yếu | Chờ 1-2 giây, thử lại |

---

## 📊 Dữ Liệu Được Lưu Trữ

### Class (Lớp Học)
```typescript
{
  id: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;  // mét
  };
}
```

### AttendanceRecord (Hồ Sơ Điểm Danh)
```typescript
{
  id: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  distanceFromClass?: number;  // km
}
```

---

## 🔧 API/Utilities

### `src/lib/geolocation.ts`

#### `getCurrentLocation(): Promise<Location>`
Lấy vị trí GPS hiện tại
```typescript
const location = await getCurrentLocation();
// { latitude: 10.1234, longitude: 106.5678, accuracy: 15 }
```

#### `calculateDistance(lat1, lon1, lat2, lon2): number`
Tính khoảng cách (km) giữa 2 điểm GPS
```typescript
const distance = calculateDistance(10.1, 106.5, 10.2, 106.6);
// 15.42
```

#### `isWithinClassRadius(lat1, lon1, lat2, lon2, radiusKm?): boolean`
Kiểm tra có trong phạm vi không
```typescript
const isWithin = isWithinClassRadius(
  studentLat, studentLon, 
  classLat, classLon, 
  1  // 1km radius
);
```

#### `formatDistance(distanceKm): string`
Format hiển thị khoảng cách
```typescript
formatDistance(0.5);   // "500m"
formatDistance(1.5);   // "1.50km"
```

---

## 🔐 Bảo Mật & Privacy

1. **Quyền Truy Cập**: Trình duyệt yêu cầu người dùng cấp quyền GPS
2. **Lưu Trữ**: GPS data được lưu trong localStorage (local machine)
3. **Không Đường Dây**: Không gửi GPS lên server (nếu dùng localStorage)
4. **Độ Chính Xác**: Hiển thị độ chính xác của GPS (accuracy in meters)

---

## 📈 Mô Tả Chi Tiết Các Tính Năng

### Công Thức Haversine
Dùng để tính khoảng cách chính xác trên bề mặt quả đất:

```
distance = 2 * R * arcsin(sqrt(sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlon/2)))
```

Với:
- R = 6371 km (bán kính Trái Đất)
- Δlat = lat2 - lat1
- Δlon = lon2 - lon1

### Độ Chính Xác GPS
- **Tốt**: < 10m
- **Bình thường**: 10-50m
- **Kém**: > 50m

---

## 🧪 Kiểm Thử

### Test Cases

1. **Lấy vị trí thành công**
   - Nhập form → Click "Lấy Vị Trí GPS"
   - Cấp quyền → Xem vị trí hiển thị

2. **Tính khoảng cách đúng**
   - Lớp: (10.1, 106.5)
   - Sinh viên: (10.1, 106.5) → Khoảng cách = 0m
   - Sinh viên: (10.2, 106.6) → Khoảng cách ≈ 15km

3. **Hiển thị trên SessionView**
   - Tạo phiên → Sinh viên điểm danh với GPS
   - Xem bảng → Cột GPS hiển thị dữ liệu

4. **Export CSV**
   - Export → Kiểm tra GPS data có trong file

---

## 🚀 Cải Tiến Tương Lai

1. **Bản Đồ Interactif**
   - Tích hợp Google Maps/Leaflet
   - Hiển thị vị trí sinh viên trên bản đồ

2. **Xác Minh Tự Động**
   - Từ chối điểm danh nếu quá xa
   - Yêu cầu xác nhận từ giáo viên

3. **Lịch Sử Vị Trí**
   - Lưu track sinh viên qua thời gian
   - Phát hiện các cuộc điểm danh bất thường

4. **Thông Báo Real-time**
   - Cảnh báo nếu sinh viên quá xa
   - Đề xuất loation verification

5. **Geofencing**
   - Tự động điểm danh khi vào phạm vi
   - Thông báo khi rời khỏi lớp

---

## 📝 Troubleshooting

### GPS không hoạt động

**Trên Desktop:**
- Chrome/Edge: Settings → Privacy → Site settings → Location
- Firefox: Options → Privacy → Permissions

**Trên Mobile:**
- Android: Cho phép GPS trong ứng dụng
- iOS: Settings → Privacy → Location Services

### Độ chính xác kém

- Chờ 30 giây để GPS lock
- Di chuyển đến vị trí mở rộng
- Tắt bật GPS và thử lại

---

**Version**: 1.0  
**Last Updated**: 2025-12-24  
**Status**: ✅ Production Ready
