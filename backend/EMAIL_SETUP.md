# 📧 Cấu hình Email (Nodemailer)

## Cách 1: Gmail App Password (Khuyên dùng cho Production)

### Bước 1 — Bật 2-Step Verification
1. Vào https://myaccount.google.com/security
2. Tìm **"2-Step Verification"** → Bật lên

### Bước 2 — Tạo App Password
1. Vào **Security** → **App passwords** (cần tắt đăng nhập bằng thiết bị khác)
2. Chọn **App = Mail**, **Device = Other** → Đặt tên `TechStore`
3. Copy 16 ký tự được cấp (ví dụ: `abcd efgh ijkl mnop`)

### Bước 3 — Điền vào `.env`
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
EMAIL_FROM="TechStore <your_gmail@gmail.com>"
```

---

## Cách 2: Mailtrap (Dev/Test — Email không gửi thật)

1. Đăng ký tại https://mailtrap.io (miễn phí)
2. Vào **Email Testing → Inboxes → SMTP Settings**
3. Copy thông tin và điền vào `.env`:

```env
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=<username từ Mailtrap>
SMTP_PASS=<password từ Mailtrap>
EMAIL_FROM="TechStore <noreply@techstore.vn>"
```

Xem email nhận được tại dashboard Mailtrap.

---

## Cách 3: Dev Mode (Không cần cấu hình)

Để trống `SMTP_HOST` trong `.env`. OTP sẽ được:
- Log ra **console** của server
- Trả về trong response `otp_dev` để test trên browser

---

## Email Templates hiện có

| Email | Khi nào gửi |
|---|---|
| ✉️ Xác thực Email | Sau khi đăng ký tài khoản |
| 🔐 Đặt lại mật khẩu | Khi request forgot password |
| 🎊 Chào mừng | Sau khi xác thực email thành công |
