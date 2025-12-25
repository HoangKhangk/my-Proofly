# ⚡ Quick Start: GPS Location Tracking

## 🎯 5 Phút Setup & Test

### 1️⃣ Chạy Ứng Dụng
```bash
cd c:/duan/my-Proofly
pnpm install
pnpm run dev
```
Visit: `http://localhost:5173`

---

### 2️⃣ Tạo Tài Khoản Giáo Viên

**Login/Register:**
- Email: `teacher@test.com`
- Password: `anything` (localStorage không check password)

---

### 3️⃣ Tạo Lớp Học Với GPS

1. Click **"Tạo Lớp Mới"**
2. Nhập:
   - Tên Lớp: `Lập Trình Web`
   - Mã Lớp: `CS101`
   - Mô Tả: `Bài học về React`

3. **[QUAN TRỌNG]** Phần "Vị Trí Lớp Học":
   - Click **"Lấy Vị Trí GPS"**
   - **Allow** quyền truy cập GPS (Chrome sẽ hỏi)
   - Chờ 2-3 giây, sẽ hiển thị tọa độ
   - Badge xanh sẽ hiển thị ✓ "Đã có"

4. Click **"Tạo Lớp"** → Lớp tạo thành công!

---

### 4️⃣ Xem Vị Trí Lớp

1. Click vào lớp vừa tạo
2. Header sẽ hiển thị:
   ```
   Lập Trình Web | CS101 | ✓ GPS: 10.7628, 106.6866
   ```
   (Dòng GPS badge màu xanh)

---

### 5️⃣ Tạo Phiên Điểm Danh

1. Click **"Tạo Phiên Điểm Danh"**
2. Nhập: `Buổi 1 - Giới thiệu React`
3. Click **"Tạo & Hiển Thị QR"**
4. Phiên được tạo, tự động redirect tới SessionView

---

### 6️⃣ Sinh Viên Điểm Danh Với GPS

**Mở URL sinh viên** (2 cách):

#### Cách 1: Copy link từ SessionView
1. Ở SessionView, click **"Hiển thị QR"**
2. Copy link hoặc quét QR
3. Mở link mới trong trình duyệt khác / tab khác

#### Cách 2: Manual URL
```
http://localhost:5173/attend/[session-code]
```

---

### 7️⃣ Điền Form Sinh Viên

1. **Nhập thông tin:**
   - Họ tên: `Nguyễn Văn A`
   - MSSV: `20210001`
   - Email: `a@student.edu`

2. **[QUAN TRỌNG] Lấy Vị Trí GPS:**
   - Click **"Lấy Vị Trí GPS"** (nút xanh)
   - **Allow** quyền GPS
   - Chờ 2-3 giây
   - Sẽ hiển thị:
     ```
     ✓ Đã có
     Vị trí: 10.7628, 106.6867
     Khoảng cách từ lớp: 5m
     ```

3. Click **"Xác Nhận Điểm Danh"**
4. ✅ Success! Thông báo hiển thị

---

### 8️⃣ Xem GPS Sinh Viên Trên Dashboard

1. Quay lại SessionView (tab giáo viên)
2. **Bảng danh sách** sẽ hiển thị cột **"Vị Trí GPS"**
3. Mỗi sinh viên hiển thị:
   - 📍 Tọa độ (6 chữ số thập phân)
   - **Distance**: 
     - 🟢 **Green**: ≤ 1km (bình thường)
     - 🟠 **Orange**: > 1km (cảnh báo)

---

## 🧪 Test Cases

### Test 1: GPS Permission Denied
1. Sinh viên click "Lấy Vị Trí GPS"
2. Nhấn **"Block"** (từ chối)
3. ❌ Toast error: "Bạn đã từ chối quyền..."
4. Thử lại với **"Allow"**

### Test 2: GPS Disabled
1. Tắt GPS trên thiết bị
2. Click "Lấy Vị Trí GPS"
3. ⏳ Chờ 10 giây timeout
4. ❌ Toast error: "Không thể lấy vị trị..."

### Test 3: Distance Calculation
1. Giáo viên lớp GPS: (10.7628, 106.6866)
2. Sinh viên 1 tại: (10.7628, 106.6866) → **0m** 🟢
3. Sinh viên 2 tại: (10.8, 106.7) → **~9km** 🟠

### Test 4: CSV Export
1. SessionView, click **"Xuất CSV"**
2. File download
3. Open file, check GPS column:
   ```
   STT,Họ tên,MSSV,Email,Thời gian,Vị trí GPS
   1,Nguyễn Văn A,20210001,a@student.edu,10:30:00,"10.7628, 106.6867"
   ```

---

## 🔍 Debug Tips

### 1. Kiểm tra GPS dữ liệu trong localStorage
```javascript
// F12 → Console → paste:
JSON.stringify(localStorage.getItem('proofly-classes'), null, 2)
// Tìm field "location" để xem GPS data
```

### 2. Simulate GPS (Chrome DevTools)
```
F12 → ⋮ menu → More Tools → Sensors
→ Location: Custom location
→ Lat: 10.7628, Lon: 106.6866
```

### 3. Clear localStorage
```javascript
localStorage.clear()
// Refresh page
```

---

## 📱 Mobile Testing

### Test trên Android
1. Open Chrome → `localhost:5173`
2. Allow location permission
3. GPS sẽ lấy từ device GPS

### Test trên iOS
1. Open Safari → `localhost:5173`
2. Cho phép Location Services
3. GPS sẽ lấy từ device GPS

---

## ❓ Troubleshooting

| Issue | Solution |
|-------|----------|
| GPS không lấy được | Cho phép browser truy cập GPS trong settings |
| Còn hiển thị "Chưa có" | Click button mới, không copy-paste |
| Distance tính sai | Refresh page, thử lại |
| "Hết thời gian chờ" | Chờ ở vị trí mở rộng, GPS cần signal |
| URL không hoạt động | Dùng `http://` (không https) trên localhost |

---

## 🎬 Demo Scenario

**Thời gian: 5 phút**

1. ✅ Đăng nhập giáo viên (30 giây)
2. ✅ Tạo lớp + lấy GPS (1 phút)
3. ✅ Tạo phiên (30 giây)
4. ✅ Sinh viên điểm danh + GPS (1 phút 30 giây)
5. ✅ Xem danh sách + GPS (30 giây)
6. ✅ Export CSV (30 giây)

**Total: ~5 phút đầy đủ demo**

---

## 📊 Key Features to Showcase

1. ✅ **GPS Auto-Detection** - Click 1 button, lấy vị trị
2. ✅ **Distance Calculation** - Tính khoảng cách tự động
3. ✅ **Real-time Display** - Hiển thị GPS trên bảng live
4. ✅ **Color Coding** - Green (OK), Orange (warning)
5. ✅ **Data Export** - GPS included trong CSV

---

## 🎯 Success Criteria

- [ ] Giáo viên tạo lớp với GPS ✓
- [ ] Sinh viên lấy GPS khi điểm danh ✓
- [ ] SessionView hiển thị GPS + khoảng cách ✓
- [ ] Bảng có màu sắc (green/orange) ✓
- [ ] CSV có GPS data ✓
- [ ] ClassDetail hiển thị GPS badge ✓

---

**Happy Testing! 🚀**

Nếu có issue, check `GPS_FEATURE.md` hoặc `GPS_IMPLEMENTATION_SUMMARY.md`
