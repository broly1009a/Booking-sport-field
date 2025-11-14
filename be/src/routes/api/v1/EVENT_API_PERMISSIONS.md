# EVENT API - PHÂN QUYỀN CHI TIẾT

## 📋 TỔNG QUAN
Hệ thống Event Matching cho phép **chủ sân** tạo sự kiện matching với giá ưu đãi, **người chơi** đăng ký tham gia.

---

## 🔐 PHÂN QUYỀN THEO VAI TRÒ

### 👤 USER (Người chơi)
**Quyền truy cập:**
- ✅ Xem và tìm kiếm event
- ✅ Đăng ký tham gia event
- ✅ Rời khỏi event đã đăng ký
- ❌ **KHÔNG** được tạo/sửa/xóa event

**API có thể sử dụng:**
```javascript
GET    /event/search              // Tìm kiếm event với filter
GET    /event/available           // Xem event còn slot
GET    /event/my-events           // Xem event đã tham gia
GET    /event/:id                 // Xem chi tiết event
POST   /event/:id/interest        // Đăng ký tham gia
DELETE /event/:id/leave           // Rời khỏi event
GET    /event/:id/check-status    // Kiểm tra trạng thái
```

---

### 🏢 OWNER/STAFF (Chủ sân/Nhân viên)
**Quyền truy cập:**
- ✅ TẤT CẢ quyền của USER
- ✅ Tạo event mới trên sân của mình
- ✅ Cập nhật/xóa event đã tạo
- ✅ Chấp nhận/từ chối/xóa người chơi
- ✅ Chuyển đổi event thành booking khi đủ người
- ⚠️ **Không tham gia chơi** (chỉ quản lý event)

**API có thể sử dụng:**
```javascript
// === QUẢN LÝ EVENT ===
POST   /event                             // Tạo event mới
PUT    /event/:id                         // Cập nhật event
DELETE /event/:id                         // Xóa/hủy event

// === QUẢN LÝ NGƯỜI CHƠI ===
POST   /event/:id/players/:playerId/accept   // Chấp nhận người chơi
POST   /event/:id/players/:playerId/reject   // Từ chối người chơi
DELETE /event/:id/players/:playerId          // Xóa người chơi

// === CHUYỂN ĐỔI BOOKING ===
POST   /event/:id/convert-to-booking     // Tạo booking từ event

// === XEM THÔNG TIN ===
GET    /event/search
GET    /event/available
GET    /event/my-events                  // Xem event đã tạo
GET    /event/:id
GET    /event/:id/check-status
```

---

### 👑 ADMIN
**Quyền truy cập:**
- ✅ TẤT CẢ quyền của OWNER/STAFF
- ✅ Quản lý mọi event (không phân biệt creator)

---

## 📡 CHI TIẾT TỪNG API

### 1️⃣ TÌM KIẾM & XEM EVENT

#### `GET /event/search`
**Phân quyền:** USER, STAFF, OWNER, ADMIN  
**Mục đích:** Tìm kiếm event với filter  
**Query params:**
```javascript
{
  playerLevel: 'beginner|intermediate|advanced|any',
  playStyle: 'casual|competitive|any',
  teamPreference: 'full-team|mixed',
  minSlots: number,
  startDate: Date,
  endDate: Date
}
```

#### `GET /event/available`
**Phân quyền:** USER, STAFF, OWNER, ADMIN  
**Mục đích:** Lấy event đang mở và còn slot  

#### `GET /event/my-events`
**Phân quyền:** USER, STAFF, OWNER, ADMIN  
**Mục đích:** Lấy event của user  
**Response:**
```javascript
{
  created: [],      // Event đã tạo (chỉ OWNER/STAFF có)
  participated: []  // Event đã tham gia
}
```

#### `GET /event/:id`
**Phân quyền:** USER, STAFF, OWNER, ADMIN  
**Mục đích:** Xem chi tiết event  

#### `GET /event/:id/check-status`
**Phân quyền:** USER, STAFF, OWNER, ADMIN  
**Mục đích:** Kiểm tra trạng thái realtime  

---

### 2️⃣ QUẢN LÝ EVENT (CHỈ OWNER/STAFF)

#### `POST /event`
**Phân quyền:** STAFF, OWNER, ADMIN  
**Mục đích:** Tạo event mới  
**Body:**
```javascript
{
  name: string,
  description: string,
  image: string,
  fieldId: ObjectId,           // Sân của chủ sân
  startTime: Date,
  endTime: Date,
  deadline: Date,              // Hạn đăng ký (mặc định 2h trước startTime)
  minPlayers: number,          // 4-8 người
  maxPlayers: number,          // 4-8 người
  playerLevel: 'beginner|intermediate|advanced|any',
  playStyle: 'casual|competitive|any',
  teamPreference: 'full-team|mixed',
  discountPercent: number      // 20-50% (mặc định 20%)
}
```

#### `PUT /event/:id`
**Phân quyền:** STAFF, OWNER, ADMIN  
**Mục đích:** Cập nhật event (chỉ khi status='open')  
**Kiểm tra:** Chỉ creator mới được update  

#### `DELETE /event/:id`
**Phân quyền:** STAFF, OWNER, ADMIN  
**Mục đích:** Hủy event  
**Kiểm tra:** 
- Chỉ creator mới được xóa
- Không thể hủy event đã confirmed/completed

---

### 3️⃣ NGƯỜI CHƠI THAM GIA (CHỈ USER)

#### `POST /event/:id/interest`
**Phân quyền:** USER, ADMIN  
**Mục đích:** Người chơi đăng ký tham gia event  
**Body:**
```javascript
{
  note: string  // Ghi chú (optional)
}
```
**Kiểm tra:**
- Event phải ở trạng thái 'open'
- Chưa hết deadline
- Còn slot trống
- Chưa đăng ký trước đó

#### `DELETE /event/:id/leave`
**Phân quyền:** USER, ADMIN  
**Mục đích:** Rời khỏi event đã đăng ký  
**Kiểm tra:**
- Chưa quá deadline
- Event chưa confirmed/completed

---

### 4️⃣ QUẢN LÝ NGƯỜI CHƠI (CHỈ OWNER/STAFF)

#### `POST /event/:id/players/:playerId/accept`
**Phân quyền:** STAFF, OWNER, ADMIN  
**Mục đích:** Chấp nhận người chơi vào event  
**Kiểm tra:**
- Chỉ creator được thực hiện
- Event ở trạng thái 'open'
- Còn slot trống
- Player ở trạng thái 'pending'

#### `POST /event/:id/players/:playerId/reject`
**Phân quyền:** STAFF, OWNER, ADMIN  
**Mục đích:** Từ chối người chơi  
**Kiểm tra:**
- Chỉ creator được thực hiện
- Player ở trạng thái 'pending'

#### `DELETE /event/:id/players/:playerId`
**Phân quyền:** STAFF, OWNER, ADMIN  
**Mục đích:** Xóa người chơi khỏi event  
**Kiểm tra:**
- Chỉ creator được thực hiện

---

### 5️⃣ CHUYỂN ĐỔI BOOKING (CHỈ OWNER/STAFF)

#### `POST /event/:id/convert-to-booking`
**Phân quyền:** STAFF, OWNER, ADMIN  
**Mục đích:** Chuyển event thành booking khi đủ người  
**Kiểm tra:**
- Chỉ creator được thực hiện
- Số người chơi đã accepted >= minPlayers
- Event chưa bị cancelled
- Chưa convert trước đó

**Kết quả:**
- Tạo booking mới với status='confirmed'
- participants chỉ gồm người chơi (không có chủ sân)
- Mỗi người chia giá đã giảm: `(fieldPrice * duration * (1 - discount%)) / totalPlayers`
- Event status chuyển thành 'confirmed'

---

## 🔄 LUỒNG HOẠT ĐỘNG

```
1. OWNER/STAFF tạo event
   └─> Event status = 'open'

2. USER đăng ký tham gia
   └─> interestedPlayers.status = 'pending'

3. OWNER/STAFF chấp nhận/từ chối
   ├─> Accept: status = 'accepted', availableSlots--
   └─> Reject: status = 'rejected'

4. Khi đủ người (acceptedPlayers >= minPlayers)
   └─> OWNER/STAFF convert to booking
       ├─> Tạo booking với participants = [accepted players]
       ├─> Event status = 'confirmed'
       └─> Booking status = 'confirmed'

5. Cron job tự động
   ├─> Nếu deadline qua mà thiếu người: status = 'cancelled'
   ├─> Nếu endTime qua: status = 'completed'
   └─> Gửi email thông báo tự động
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

1. **Chủ sân KHÔNG tham gia chơi:**
   - availableSlots = maxPlayers (không trừ creator)
   - totalPlayers chỉ tính người chơi đã accepted
   - participants trong booking không có chủ sân

2. **Người chơi KHÔNG thể tạo event:**
   - Chỉ OWNER/STAFF/ADMIN được tạo event
   - USER chỉ được đăng ký tham gia

3. **Giá chia đều cho người chơi:**
   - Giá gốc: `fieldPrice * duration`
   - Giá sau giảm: `giaGoc * (1 - discountPercent/100)`
   - Giá/người: `giaSauGiam / totalPlayers`

4. **Auto-cancel bởi cron job:**
   - Chạy mỗi 5 phút kiểm tra deadline
   - Nếu thiếu người: tự động hủy + email thông báo
   - Nếu đủ người: tự động confirm + email thông báo

---

## 📞 LIÊN HỆ
Nếu có thắc mắc về phân quyền API, vui lòng liên hệ team backend.
