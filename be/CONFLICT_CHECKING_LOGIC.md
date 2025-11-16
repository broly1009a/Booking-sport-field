# Logic Kiểm Tra Xung Đột Thời Gian (Conflict Checking)

## Vấn đề
Khi user tham gia sự kiện ghép trận (event matching), cần đảm bảo họ không có lịch đặt sân hoặc event khác trùng giờ.

## Giải pháp đã implement

### 1. API Endpoints mới

#### GET `/api/v1/event/my-schedule`
- **Mục đích**: Lấy tất cả lịch trình sắp tới của user (bookings + events)
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "type": "booking",
      "id": "...",
      "startTime": "2025-11-20T10:00:00Z",
      "endTime": "2025-11-20T12:00:00Z",
      "field": { "name": "Sân 1", "location": "..." },
      "status": "confirmed"
    },
    {
      "type": "event",
      "id": "...",
      "name": "Event ghép trận",
      "startTime": "2025-11-21T14:00:00Z",
      "endTime": "2025-11-21T16:00:00Z",
      "field": { "name": "Sân 2", "location": "..." },
      "status": "confirmed"
    }
  ]
}
```

#### POST `/api/v1/event/check-conflict`
- **Mục đích**: Kiểm tra xem một khoảng thời gian có bị conflict không
- **Body**:
```json
{
  "startTime": "2025-11-20T10:00:00Z",
  "endTime": "2025-11-20T12:00:00Z"
}
```
- **Response**:
```json
{
  "success": true,
  "hasConflict": false,
  "message": "Không có xung đột"
}
```

### 2. Tự động kiểm tra khi tham gia event

Khi user gọi `POST /api/v1/event/:id/interest`, hệ thống sẽ:

1. ✅ Kiểm tra tất cả **bookings** của user có status: `pending`, `confirmed`, `waiting`
2. ✅ Kiểm tra tất cả **events** mà user đã tham gia (status = `accepted`)
3. ✅ So sánh thời gian theo logic overlap:
   - Event mới bắt đầu trong khoảng thời gian có sẵn
   - Event mới kết thúc trong khoảng thời gian có sẵn  
   - Event mới bao trùm khoảng thời gian có sẵn

4. ❌ Từ chối nếu có conflict với thông báo:
   ```
   "Bạn đã có lịch đặt sân hoặc event khác trùng thời gian. 
    Vui lòng kiểm tra lại lịch của bạn!"
   ```

### 3. Logic kiểm tra overlap

```javascript
// Kiểm tra 3 trường hợp overlap:
{
  $or: [
    // Case 1: Bắt đầu trong khoảng
    { startTime: { $gte: start, $lt: end } },
    
    // Case 2: Kết thúc trong khoảng
    { endTime: { $gt: start, $lte: end } },
    
    // Case 3: Bao trùm hoàn toàn
    { startTime: { $lte: start }, endTime: { $gte: end } }
  ]
}
```

## Flow hoàn chỉnh

### Khi user tham gia event:
```
User nhấn "Tham gia" 
  ↓
Frontend gọi: POST /api/v1/event/:id/interest
  ↓
Backend kiểm tra:
  1. Event còn slot không?
  2. User đã tham gia chưa?
  3. ✨ User có conflict thời gian không? (MỚI)
  ↓
Nếu OK → Thêm vào danh sách pending
Nếu conflict → Trả về error 400
```

### Hiển thị lịch trình (tùy chọn):
```
User vào trang "Lịch của tôi"
  ↓
Frontend gọi: GET /api/v1/event/my-schedule
  ↓
Hiển thị calendar/timeline với:
  - Bookings đã đặt
  - Events đã tham gia
  - Highlight conflicts
```

## Lợi ích

✅ **Tự động**: Không cần user tự kiểm tra
✅ **Chính xác**: Kiểm tra cả bookings và events
✅ **Real-time**: Kiểm tra ngay khi tham gia
✅ **Transparent**: API riêng để xem lịch trình
✅ **Scalable**: Dễ mở rộng thêm loại activities khác

## Testing

### Test case 1: User có booking trùng giờ
```bash
# User có booking: 10:00 - 12:00
# Event mới: 11:00 - 13:00
# → Bị từ chối ✅
```

### Test case 2: User có event trùng giờ
```bash
# User đã tham gia event: 14:00 - 16:00
# Event mới: 15:00 - 17:00
# → Bị từ chối ✅
```

### Test case 3: Không có conflict
```bash
# User có booking: 10:00 - 12:00
# Event mới: 14:00 - 16:00
# → Được phép tham gia ✅
```

### Test case 4: Event bị từ chối không tính
```bash
# User có event với status = 'rejected'
# Event mới trùng giờ
# → Được phép tham gia ✅ (vì rejected không đếm)
```

## Future Enhancements

1. **Buffer time**: Thêm khoảng cách tối thiểu giữa các activities (VD: 30 phút)
2. **Warning nhẹ**: Cho phép override với warning nếu khoảng cách ngắn
3. **Recurring events**: Hỗ trợ event lặp lại
4. **Location conflict**: Kiểm tra thêm khoảng cách địa lý
