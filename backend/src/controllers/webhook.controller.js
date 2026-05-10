const Order = require('../models/Order');
const axios = require('axios');

exports.cassoWebhook = async (req, res) => {
  console.log('\n[WEBHOOK CATCHED] Đã nhận được 1 request truy cập vào /api/webhooks/casso');
  try {
    const secureToken = req.headers['secure-token'];
    const expectedToken = process.env.CASSO_SECURE_TOKEN;

    console.log(`- Token nhận được: ${secureToken}`);
    console.log(`- Token mong đợi (env): ${expectedToken}`);

    if (expectedToken && secureToken !== expectedToken) {
      console.log('=> TỪ CHỐI: Sai secure-token!');
      return res.status(401).json({ message: 'Invalid secure token' });
    }

    const { error, data } = req.body;
    if (error !== 0 || !data || !data.length) {
      return res.status(200).json({ message: 'No valid data' });
    }

    console.log('--- NHẬN WEBHOOK TỪ CASSO ---');
    console.log('Data nhận được:', JSON.stringify(data, null, 2));

    for (const transaction of data) {
      const { description, amount } = transaction;
      console.log(`\nĐang xử lý giao dịch: Amount = ${amount}, Description = "${description}"`);

      // Giả sử mã đơn hàng (orderNumber) được đính kèm trọn vẹn trong nội dung
      // Tìm đơn hàng có trạng thái 'pending' và orderNumber nằm trong nội dung mô tả
      const orders = await Order.find({ paymentStatus: 'pending' }).populate('user');
      console.log(`Tìm thấy ${orders.length} đơn hàng đang pending trong Database để đối soát.`);
      
      let matched = false;
      for (const order of orders) {
        // Loại bỏ tất cả ký tự đặc biệt, dấu gạch ngang, khoảng trắng để so sánh chính xác nhất
        const cleanDescription = description.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const cleanOrderNumber = order.orderNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        
        console.log(`- So sánh: cleanDescription [${cleanDescription}] có chứa cleanOrderNumber [${cleanOrderNumber}] không? -> ${cleanDescription.includes(cleanOrderNumber)}`);
        console.log(`- So sánh: amount [${amount}] >= order.total [${order.total}] không? -> ${amount >= order.total}`);

        if (cleanDescription.includes(cleanOrderNumber) && amount >= order.total) {
          console.log(`=> ĐÃ KHỚP ĐƠN HÀNG: ${order.orderNumber}. Tiến hành cập nhật paymentStatus = 'paid'`);
          matched = true;
          order.paymentStatus = 'paid';
          await order.save();
          
          // Gửi dữ liệu chi tiết lên Google Sheets
          try {
            const googleScriptUrl = 'https://script.google.com/macros/s/AKfycbz6CD2fX8Ty0zAUtrv_0x74qvfWykMsuEaHJj5QY9LXImyZBFa620QpLWy-vftXySfpzg/exec';
            const payload = {
              orderNumber: order.orderNumber,
              userId: order.user ? order.user._id.toString() : 'Guest',
              customerName: order.shippingAddress?.name || 'Unknown',
              products: order.items.map(item => `${item.quantity}x ${item.name}`).join('\n'),
              totalAmount: order.total,
              transferAmount: amount,
              transferContent: description,
              time: transaction.when || new Date().toISOString()
            };

            await axios.post(googleScriptUrl, payload, {
              headers: {
                'Content-Type': 'application/json'
              }
            });
            console.log('Đã đẩy dữ liệu đơn hàng', order.orderNumber, 'lên Google Sheets thành công.');
          } catch (sheetErr) {
            console.error('Lỗi khi đẩy lên Google Sheets:', sheetErr.message);
          }
        }
      }
    }

    return res.status(200).json({ error: 0, message: 'Success' });
  } catch (error) {
    console.error('Casso Webhook Error:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};
