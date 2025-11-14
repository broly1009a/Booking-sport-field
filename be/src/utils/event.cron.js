const cron = require('node-cron');
const Event = require('../models/event.model');
const { sendEventNotification } = require('../configs/nodemailer.config');

// Helper: Gửi email thông báo
async function sendEventEmailNotification(event, type, additionalInfo = {}) {
    try {
        const acceptedPlayers = event.interestedPlayers.filter(p => p.status === 'accepted');
        const allUsers = [event.createdBy, ...acceptedPlayers.map(p => p.userId)];
        
        // Lọc email hợp lệ
        const emails = allUsers
            .filter(user => user && user.email)
            .map(user => user.email);
        
        if (emails.length === 0) {
            console.log('[Event Cron] Không có email để gửi');
            return;
        }
        
        let subject, htmlContent;
        
        switch (type) {
            case 'confirmed':
                subject = `✅ Event "${event.name}" đã được xác nhận`;
                htmlContent = `
                    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <h2 style="color: #28a745; text-align: center;">✅ Event Đã Được Xác Nhận!</h2>
                            <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #28a745;">
                                <p style="margin: 5px 0;"><strong>Tên event:</strong> ${event.name}</p>
                                <p style="margin: 5px 0;"><strong>Mô tả:</strong> ${event.description}</p>
                                <p style="margin: 5px 0;"><strong>Thời gian:</strong> ${new Date(event.startTime).toLocaleString('vi-VN')} - ${new Date(event.endTime).toLocaleString('vi-VN')}</p>
                                <p style="margin: 5px 0;"><strong>Số người tham gia:</strong> ${acceptedPlayers.length + 1}/${event.maxPlayers}</p>
                                <p style="margin: 5px 0;"><strong>Sân:</strong> ${event.fieldId?.name || 'N/A'} - ${event.fieldId?.location || ''}</p>
                                <p style="margin: 5px 0;"><strong>Giá ước tính/người:</strong> ${event.estimatedPrice?.toLocaleString('vi-VN')}đ</p>
                            </div>
                            <p style="text-align: center; color: #666; margin-top: 20px;">Hãy chuẩn bị và đến đúng giờ nhé! 🎉</p>
                            <p style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
                                Đội ngũ hỗ trợ của fptsportsfield.io.vn
                            </p>
                        </div>
                    </div>
                `;
                break;
                
            case 'cancelled':
                subject = `❌ Event "${event.name}" đã bị hủy`;
                htmlContent = `
                    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <h2 style="color: #dc3545; text-align: center;">❌ Event Đã Bị Hủy</h2>
                            <div style="margin: 20px 0; padding: 15px; background-color: #f8d7da; border-left: 4px solid #dc3545;">
                                <p style="margin: 5px 0;"><strong>Tên event:</strong> ${event.name}</p>
                                <p style="margin: 5px 0;"><strong>Lý do:</strong> Không đủ số lượng người tham gia tối thiểu</p>
                                <p style="margin: 5px 0;"><strong>Số người đã có:</strong> ${additionalInfo.acceptedCount}/${event.minPlayers}</p>
                                <p style="margin: 5px 0;"><strong>Thời gian dự kiến:</strong> ${new Date(event.startTime).toLocaleString('vi-VN')}</p>
                            </div>
                            <p style="text-align: center; color: #666; margin-top: 20px;">
                                Rất tiếc về sự bất tiện này. Bạn có thể tạo event mới hoặc tham gia event khác! 😊
                            </p>
                            <p style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
                                Đội ngũ hỗ trợ của fptsportsfield.io.vn
                            </p>
                        </div>
                    </div>
                `;
                break;
                
            case 'warning':
                subject = `⚠️ Cảnh báo: Event "${event.name}" sắp bị hủy`;
                htmlContent = `
                    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <h2 style="color: #ffc107; text-align: center;">⚠️ Cảnh Báo Quan Trọng!</h2>
                            <div style="margin: 20px 0; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107;">
                                <p style="margin: 5px 0;"><strong>Tên event:</strong> ${event.name}</p>
                                <p style="margin: 5px 0;"><strong>Số người hiện tại:</strong> ${additionalInfo.acceptedCount}/${event.minPlayers}</p>
                                <p style="margin: 5px 0; color: #dc3545;"><strong>Còn thiếu:</strong> ${event.minPlayers - additionalInfo.acceptedCount} người</p>
                                <p style="margin: 5px 0;"><strong>Thời gian còn lại:</strong> ${additionalInfo.timeLeft}</p>
                                <p style="margin: 5px 0;"><strong>Deadline:</strong> ${new Date(event.deadline).toLocaleString('vi-VN')}</p>
                            </div>
                            <p style="text-align: center; color: #666; margin-top: 20px;">
                                Hãy mời thêm bạn bè hoặc giảm số người tối thiểu (minPlayers) để event không bị hủy!
                            </p>
                            <p style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
                                Đội ngũ hỗ trợ của fptsportsfield.io.vn
                            </p>
                        </div>
                    </div>
                `;
                break;
                
            default:
                return;
        }
        
        console.log(`[Event Cron] 📧 Đang gửi email ${type} cho event ${event._id} đến ${emails.length} người`);
        await sendEventNotification(emails, subject, htmlContent);
        
    } catch (error) {
        console.error('[Event Cron] Lỗi khi gửi email:', error.message);
    }
}

// 1. Kiểm tra và xử lý event đã qua deadline
async function checkEventDeadlines() {
    try {
        console.log('[Event Cron] 🔍 Kiểm tra event deadlines...', new Date());
        
        const now = new Date();
        
        // Tìm các event đã qua deadline nhưng vẫn 'open'
        const expiredEvents = await Event.find({
            status: 'open',
            deadline: { $lte: now }
        })
        .populate('createdBy', 'name email')
        .populate('fieldId', 'name location price')
        .populate('interestedPlayers.userId', 'name email');
        
        console.log(`[Event Cron] Tìm thấy ${expiredEvents.length} event đã qua deadline`);
        
        for (const event of expiredEvents) {
            const acceptedPlayers = event.interestedPlayers.filter(p => p.status === 'accepted');
            const acceptedCount = acceptedPlayers.length + 1; // +1 cho creator
            
            if (acceptedCount >= event.minPlayers) {
                // ✅ Đủ người → Tự động confirm
                event.status = 'confirmed';
                await event.save();
                
                // Gửi email thông báo
                await sendEventEmailNotification(event, 'confirmed');
                
                console.log(`✅ Event ${event._id} (${event.name}) auto-confirmed với ${acceptedCount} người`);
            } else {
                // ❌ Thiếu người → Hủy
                event.status = 'cancelled';
                await event.save();
                
                // Gửi email thông báo hủy
                await sendEventEmailNotification(event, 'cancelled', { acceptedCount });
                
                console.log(`❌ Event ${event._id} (${event.name}) cancelled - thiếu người (${acceptedCount}/${event.minPlayers})`);
            }
        }
        
    } catch (error) {
        console.error('[Event Cron] Lỗi khi kiểm tra deadline:', error);
    }
}

// 2. Gửi cảnh báo trước deadline (2 giờ trước)
async function sendDeadlineWarnings() {
    try {
        console.log('[Event Cron] ⚠️ Kiểm tra event cần cảnh báo...', new Date());
        
        const now = new Date();
        const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        
        // Tìm event sắp đến deadline (trong vòng 2 giờ) và vẫn thiếu người
        const warningEvents = await Event.find({
            status: 'open',
            deadline: { 
                $gt: now,
                $lte: twoHoursLater 
            }
        })
        .populate('createdBy', 'name email')
        .populate('fieldId', 'name location')
        .populate('interestedPlayers.userId', 'name email');
        
        console.log(`[Event Cron] Tìm thấy ${warningEvents.length} event cần cảnh báo`);
        
        for (const event of warningEvents) {
            const acceptedPlayers = event.interestedPlayers.filter(p => p.status === 'accepted');
            const acceptedCount = acceptedPlayers.length + 1;
            
            // Chỉ cảnh báo nếu thiếu người
            if (acceptedCount < event.minPlayers) {
                const timeLeft = Math.round((event.deadline - now) / (60 * 1000)); // phút
                const timeLeftStr = timeLeft >= 60 
                    ? `${Math.floor(timeLeft / 60)} giờ ${timeLeft % 60} phút`
                    : `${timeLeft} phút`;
                
                // Gửi email cảnh báo
                await sendEventEmailNotification(event, 'warning', { 
                    acceptedCount,
                    timeLeft: timeLeftStr
                });
                
                console.log(`⚠️ Đã gửi cảnh báo cho event ${event._id} (${event.name}) - thiếu ${event.minPlayers - acceptedCount} người`);
            }
        }
        
    } catch (error) {
        console.error('[Event Cron] Lỗi khi gửi cảnh báo:', error);
    }
}

// 3. Tự động chuyển event sang completed sau khi kết thúc
async function completeFinishedEvents() {
    try {
        console.log('[Event Cron] 🏁 Kiểm tra event đã kết thúc...', new Date());
        
        const now = new Date();
        
        // Tìm event đã qua endTime nhưng vẫn 'confirmed'
        const finishedEvents = await Event.find({
            status: 'confirmed',
            endTime: { $lte: now }
        });
        
        console.log(`[Event Cron] Tìm thấy ${finishedEvents.length} event đã kết thúc`);
        
        for (const event of finishedEvents) {
            event.status = 'completed';
            await event.save();
            
            console.log(`🏁 Event ${event._id} (${event.name}) đã hoàn thành`);
        }
        
    } catch (error) {
        console.error('[Event Cron] Lỗi khi hoàn thành event:', error);
    }
}

// 4. Xóa event cũ đã cancelled hoặc completed (sau 7 ngày)
async function cleanupOldEvents() {
    try {
        console.log('[Event Cron] 🧹 Dọn dẹp event cũ...', new Date());
        
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        // Xóa event đã cancelled/completed cách đây 7 ngày
        const result = await Event.deleteMany({
            status: { $in: ['cancelled', 'completed'] },
            updatedAt: { $lt: sevenDaysAgo }
        });
        
        console.log(`🧹 Đã xóa ${result.deletedCount} event cũ (>7 ngày)`);
        
    } catch (error) {
        console.error('[Event Cron] Lỗi khi dọn dẹp event cũ:', error);
    }
}

// 5. Đăng ký tất cả cron jobs
function registerEventCrons() {
    console.log('[Event Cron] 📅 Đang đăng ký cron jobs cho Event...');
    
    // Kiểm tra deadline mỗi 5 phút
    cron.schedule('*/5 * * * *', checkEventDeadlines);
    console.log('[Event Cron] ✓ Đã đăng ký: Kiểm tra deadline (mỗi 5 phút)');
    
    // Gửi cảnh báo mỗi 30 phút
    cron.schedule('*/30 * * * *', sendDeadlineWarnings);
    console.log('[Event Cron] ✓ Đã đăng ký: Gửi cảnh báo (mỗi 30 phút)');
    
    // Hoàn thành event mỗi 10 phút
    cron.schedule('*/10 * * * *', completeFinishedEvents);
    console.log('[Event Cron] ✓ Đã đăng ký: Hoàn thành event (mỗi 10 phút)');
    
    // Dọn dẹp event cũ mỗi ngày lúc 3:00 AM
    cron.schedule('0 3 * * *', cleanupOldEvents);
    console.log('[Event Cron] ✓ Đã đăng ký: Dọn dẹp event cũ (3:00 AM hàng ngày)');
    
    console.log('[Event Cron] ✅ Đã đăng ký tất cả cron jobs cho Event!');
}

module.exports = {
    registerEventCrons,
    checkEventDeadlines,
    sendDeadlineWarnings,
    completeFinishedEvents,
    cleanupOldEvents
};
