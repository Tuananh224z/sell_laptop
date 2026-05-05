/**
 * Email Service — Nodemailer + Gmail SMTP
 *
 * Để dùng Gmail:
 *   1. Bật 2-Step Verification trên Gmail
 *   2. Vào Google Account → Security → App Passwords → tạo App Password
 *   3. Điền vào .env:
 *        SMTP_HOST=smtp.gmail.com
 *        SMTP_PORT=465
 *        SMTP_USER=your_gmail@gmail.com
 *        SMTP_PASS=xxxx xxxx xxxx xxxx   (App Password - 16 ký tự)
 *        EMAIL_FROM="TechStore <your_gmail@gmail.com>"
 *
 * Hoặc dùng Mailtrap (dev/test):
 *        SMTP_HOST=sandbox.smtp.mailtrap.io
 *        SMTP_PORT=2525
 *        SMTP_USER=<mailtrap_user>
 *        SMTP_PASS=<mailtrap_pass>
 *        EMAIL_FROM="TechStore <noreply@techstore.vn>"
 */

const nodemailer = require('nodemailer');

/* ─── Transporter ─── */
const createTransporter = () => {
  // Dùng SMTP config từ .env
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback: Ethereal (auto-create dev account)
  return null;
};

/* ─── HTML Templates ─── */
const baseLayout = (content) => `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>TechStore</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:32px 40px;text-align:center;">
              <span style="background:rgba(255,255,255,0.2);color:#fff;font-size:24px;font-weight:900;padding:8px 16px;border-radius:10px;letter-spacing:2px;">TS</span>
              <h1 style="margin:12px 0 0;color:#fff;font-size:22px;font-weight:700;letter-spacing:0.5px;">TechStore</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">
                © 2026 TechStore. Mọi quyền được bảo lưu.<br/>
                Nếu bạn không yêu cầu email này, hãy bỏ qua nó.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const otpBlock = (otp) => `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td align="center" style="background:#eff6ff;border:2px dashed #bfdbfe;border-radius:12px;padding:24px;">
        <p style="margin:0 0 8px;color:#64748b;font-size:13px;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Mã xác thực của bạn</p>
        <div style="font-size:42px;font-weight:900;letter-spacing:12px;color:#1d4ed8;font-family:'Courier New',monospace;">${otp}</div>
        <p style="margin:8px 0 0;color:#94a3b8;font-size:12px;">Mã có hiệu lực trong <strong style="color:#ef4444;">10 phút</strong></p>
      </td>
    </tr>
  </table>
`;

const warningBlock = (text) => `
  <div style="background:#fef3c7;border-left:4px solid #f59e0b;border-radius:8px;padding:14px 16px;margin-top:20px;">
    <p style="margin:0;color:#92400e;font-size:13px;">⚠️ ${text}</p>
  </div>
`;

/* ─── Email Templates ─── */
const templates = {
  verifyEmail: (name, otp) => ({
    subject: '✉️ Xác thực tài khoản TechStore của bạn',
    html: baseLayout(`
      <h2 style="margin:0 0 8px;color:#1e293b;font-size:24px;font-weight:800;">Xác thực Email 🎉</h2>
      <p style="margin:0 0 20px;color:#64748b;line-height:1.7;">
        Xin chào <strong style="color:#1e293b;">${name}</strong>,<br/>
        Cảm ơn bạn đã đăng ký tài khoản tại <strong>TechStore</strong>. Vui lòng nhập mã OTP dưới đây để hoàn tất xác thực.
      </p>
      ${otpBlock(otp)}
      ${warningBlock('Không chia sẻ mã này với bất kỳ ai. TechStore sẽ không bao giờ hỏi mã OTP của bạn.')}
      <p style="margin:20px 0 0;color:#94a3b8;font-size:13px;">Nếu bạn không tạo tài khoản này, hãy bỏ qua email này.</p>
    `),
  }),

  resetPassword: (name, otp) => ({
    subject: '🔐 Đặt lại mật khẩu TechStore',
    html: baseLayout(`
      <h2 style="margin:0 0 8px;color:#1e293b;font-size:24px;font-weight:800;">Đặt lại mật khẩu</h2>
      <p style="margin:0 0 20px;color:#64748b;line-height:1.7;">
        Xin chào <strong style="color:#1e293b;">${name}</strong>,<br/>
        Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nhập mã OTP dưới đây để tiếp tục.
      </p>
      ${otpBlock(otp)}
      ${warningBlock('Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này và đảm bảo tài khoản của bạn an toàn.')}
    `),
  }),

  welcomeVerified: (name) => ({
    subject: '🎊 Chào mừng đến TechStore!',
    html: baseLayout(`
      <div style="text-align:center;margin-bottom:28px;">
        <div style="width:72px;height:72px;background:#dcfce7;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
          <span style="font-size:36px;">✅</span>
        </div>
        <h2 style="margin:0 0 8px;color:#1e293b;font-size:24px;font-weight:800;">Tài khoản đã được xác thực!</h2>
        <p style="margin:0;color:#64748b;">Chào mừng <strong style="color:#1e293b;">${name}</strong> đến với TechStore 🎉</p>
      </div>
      <p style="color:#64748b;line-height:1.7;margin:0 0 20px;">
        Tài khoản của bạn đã được xác thực thành công. Bạn có thể bắt đầu mua sắm các sản phẩm công nghệ hàng đầu tại TechStore ngay bây giờ!
      </p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding-top:12px;">
            <a href="${process.env.CLIENT_URL}" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;text-decoration:none;padding:14px 36px;border-radius:10px;font-weight:700;font-size:15px;letter-spacing:0.3px;">
              Bắt đầu mua sắm →
            </a>
          </td>
        </tr>
      </table>
    `),
  }),
};

/* ─── Send Email ─── */
const sendEmail = async ({ to, subject, html }) => {
  // Nếu không cấu hình SMTP → log ra console (dev mode)
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[EMAIL - DEV MODE] Chưa cấu hình SMTP');
    console.log(`📬 To     : ${to}`);
    console.log(`📌 Subject: ${subject}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return { preview: null, devMode: true };
  }

  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"TechStore" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });

  console.log(`✅ Email sent to ${to} — MessageId: ${info.messageId}`);
  return { messageId: info.messageId };
};

/* ─── Exported helpers ─── */
exports.sendVerifyEmail = async (to, name, otp) => {
  const { subject, html } = templates.verifyEmail(name, otp);
  return sendEmail({ to, subject, html });
};

exports.sendResetPasswordEmail = async (to, name, otp) => {
  const { subject, html } = templates.resetPassword(name, otp);
  return sendEmail({ to, subject, html });
};

exports.sendWelcomeVerifiedEmail = async (to, name) => {
  const { subject, html } = templates.welcomeVerified(name);
  return sendEmail({ to, subject, html });
};
