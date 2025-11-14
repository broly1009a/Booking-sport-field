const nodemailer = require("nodemailer");
require('dotenv').config();
const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_APP,
        pass: process.env.PASS_APP
    }
});

async function sendVerificationEmail(email, verificationLink) {
    const mailOptions = {
        from: process.env.EMAIL_APP,
        to: email,
        subject: "Xác minh tài khoản ứng dụng fptsportsfield.io.vn",
        text: `fptsportsfield.io.vn xin chào bạn!\n\nBạn vui lòng vào liên kết sau để xác thực tài khoản: ${verificationLink}\n\nCảm ơn bạn!`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #333;">Chào bạn!</h2>
                <p>Cảm ơn bạn đã đăng ký tài khoản trên ứng dụng <strong>fptsportsfield.io.vn</strong>. Để hoàn tất quá trình đăng ký, bạn vui lòng nhấn vào liên kết dưới đây để xác thực tài khoản của mình:</p>
                <a href="${verificationLink}" style="display: inline-block; background-color: #006D38; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Xác thực tài khoản</a>
                <p style="margin-top: 20px;">Nếu bạn không phải là người đăng ký, bạn có thể bỏ qua email này.</p>
                <p>Cảm ơn bạn!</p>
                <p>Đội ngũ hỗ trợ của fptsportsfield.io.vn</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw new Error(error.message)
    }
}

async function sendNewPassword(email, newPassword) {
    const mailOptions = {
        from: process.env.EMAIL_APP,
        to: email,
        subject: "Cấp lại mật khẩu tài khoản trên ứng dụng fptsportsfield.io.vn",
        text: `fptsportsfield.io.vn xin chào bạn!\n\nMật khẩu mới của bạn là: ${newPassword}\n\nXin hãy đăng nhập vào tài khoản của bạn để thay đổi mật khẩu nếu cần.\n\nCảm ơn bạn!`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #333;">Chào bạn!</h2>
                <p>Mật khẩu mới của bạn cho tài khoản <strong>fptsportsfield.io.vn</strong> là:</p>
                <h3 style="color: #006D38;">${newPassword}</h3>
                <p>Vui lòng đăng nhập vào tài khoản của bạn để thay đổi mật khẩu nếu cần thiết.</p>
                <p style="margin-top: 20px;">Nếu bạn không yêu cầu cấp lại mật khẩu này, vui lòng bỏ qua email này.</p>
                <p>Cảm ơn bạn!</p>
                <p>Đội ngũ hỗ trợ của fptsportsfield.io.vn</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw new Error(error.message)
    }
}

async function sendEventNotification(emails, subject, htmlContent) {
    const mailOptions = {
        from: process.env.EMAIL_APP,
        to: emails.join(', '),
        subject: subject,
        html: htmlContent
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`📧 Email đã gửi thành công đến ${emails.length} người`);
    } catch (error) {
        console.error('❌ Lỗi khi gửi email:', error.message);
        throw new Error(error.message);
    }
}

module.exports = {
    sendVerificationEmail,
    sendNewPassword,
    sendEventNotification
}