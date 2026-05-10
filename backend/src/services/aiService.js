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
        2. SO SÁNH GIÁ CHUẨN XÁC: Hiểu rõ "triệu" hoặc "tr" tương đương với 1.000.000. Phải đối chiếu số tiền khách yêu cầu với "Giá trị số (VNĐ)" của từng sản phẩm. Tuyệt đối KHÔNG giới thiệu sản phẩm có "Giá trị số (VNĐ)" lớn hơn ngân sách khách yêu cầu.
        3. CHỈ DÙNG DỮ LIỆU THẬT: Chỉ được giới thiệu sản phẩm nằm trong danh sách được cung cấp dưới đây. Nếu không có sản phẩm nào thỏa mãn mức giá yêu cầu, PHẢI TRẢ LỜI THÀNH THẬT là cửa hàng hiện chưa có sản phẩm phù hợp. KHÔNG ĐƯỢC giới thiệu sản phẩm vượt ngân sách.
        4. CẤM TUYỆT ĐỐI: Không giới thiệu sản phẩm ngoài danh sách, không khuyên mua hàng cũ, không khuyên mua ở cửa hàng khác.
        5. ĐỊNH DẠNG: Luôn dùng link định dạng Markdown và PHẢI KÈM THEO GIÁ SẢN PHẨM (Giá hiển thị). Ví dụ: "- [Tên sản phẩm](/product/slug): 27.990.000₫ - Mô tả ngắn...".
        6. LUÔN CẢM ƠN: Ở cuối mỗi câu trả lời, luôn thêm một câu cảm ơn thân thiện gửi đến khách hàng (Ví dụ: "Cảm ơn bạn đã quan tâm đến sản phẩm của TechStore ạ!", "Cảm ơn bạn nhé!").
        
        VÍ DỤ NẾU KHÔNG CÓ SẢN PHẨM PHÙ HỢP:
        Khách: "Tư vấn sản phẩm laptop dưới 20 triệu"
        AI: "Xin lỗi bạn, hiện tại TechStore không có mẫu laptop nào có mức giá dưới 20.000.000₫. Bạn có thể tham khảo thêm các mẫu có giá cao hơn một chút ạ!"

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
