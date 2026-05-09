const Groq = require('groq-sdk');
const Product = require('../models/Product');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/**
 * Lấy toàn bộ sản phẩm và định dạng thành context cho AI
 */
const getProductContext = async () => {
  try {
    const products = await Product.find({ isActive: true })
      .select('name price shortDesc rating category brand slug')
      .populate('category', 'name')
      .populate('brand', 'name')
      .lean();

    let context = "Dưới đây là DANH SÁCH SẢN PHẨM DUY NHẤT có trong kho TechStore:\n";
    products.forEach((p, index) => {
      context += `[Sản phẩm: ${p.name}]\n`;
      context += `- Giá hiển thị: ${p.price.toLocaleString('vi-VN')}₫\n`;
      context += `- Giá trị số (VNĐ): ${p.price}\n`;
      context += `- Slug: ${p.slug}\n`;
      context += `- Link: [${p.name}](/product/${p.slug})\n`;
      context += `- Mô tả: ${p.shortDesc}\n\n`;
    });

    return context;
  } catch (error) {
    console.error("Error fetching product context:", error);
    return "Hiện tại không thể lấy danh sách sản phẩm.";
  }
};

/**
 * Gọi Groq API để lấy phản hồi tư vấn
 */
exports.getAIConsultantResponse = async (userMessage, chatHistory = []) => {
  try {
    const productContext = await getProductContext();

    const messages = [
      {
        role: "system",
        content: `Bạn là Trợ lý Bán hàng của TechStore.
        
        NGUYÊN TẮC VÀNG:
        1. TRẢ LỜI ĐÚNG TRỌNG TÂM: Không dài dòng, không giải thích lý thuyết. Khách hỏi gì đáp nấy.
        2. CHỈ DÙNG DỮ LIỆU THẬT: Chỉ được giới thiệu sản phẩm có "Giá trị số" thỏa mãn điều kiện khách hỏi từ danh sách dưới đây.
        3. CẤM TUYỆT ĐỐI: Không giới thiệu sản phẩm ngoài danh sách, không khuyên mua hàng cũ, không khuyên mua ở cửa hàng khác.
        4. ĐỊNH DẠNG: Luôn dùng link [Tên sản phẩm](/product/slug).
        
        VÍ DỤ TỐT:
        Khách: "Laptop dưới 30tr"
        AI: "TechStore hiện có sản phẩm phù hợp ngân sách của bạn:
        - [MacBook Air M3 13 inch 2024](/product/macbook-air-m3-13-inch-2024): 27.990.000₫.
        Mời bạn tham khảo ạ!"

        DANH SÁCH SẢN PHẨM TRONG KHO:
        ${productContext}`
      },
      ...chatHistory,
      {
        role: "user",
        content: userMessage
      }
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: "llama-3.1-8b-instant",
      temperature: 0, // Giữ temperature = 0 để AI không sáng tạo bậy
      max_tokens: 1024,
      top_p: 1,
      stream: false,
    });

    return chatCompletion.choices[0]?.message?.content || "Xin lỗi, tôi gặp chút trục trặc. Bạn có thể hỏi lại được không?";
  } catch (error) {
    console.error("Groq API Error:", error);
    return "Hệ thống AI đang bận, bạn vui lòng thử lại sau giây lát.";
  }
};
