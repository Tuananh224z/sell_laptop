import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  Loader2,
  Maximize2,
  Minimize2,
  Paperclip,
  PlayCircle,
} from "lucide-react";
import api from "../../config/Axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";

const BACKEND =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const AI_RESPONSES: Record<string, string> = {
  default:
    "Xin chào! Tôi là trợ lý AI của TechStore. Tôi có thể giúp bạn tư vấn sản phẩm, so sánh cấu hình, hay giải đáp thắc mắc. Bạn cần hỗ trợ gì ạ?",
};

/* ─── Chat bubble component ─── */
const Bubble = ({ msg, isMe }: { msg: any; isMe: boolean }) => {
  const navigate = useNavigate();

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} gap-2`}>
      {!isMe && (
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-1 bg-violet-600 text-white shadow-sm border border-white">
          <Bot className="w-4 h-4" />
        </div>
      )}
      <div
        className={`max-w-[80%] flex flex-col ${isMe ? "items-end" : "items-start"}`}
      >
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
            isMe
              ? "bg-primary-600 text-white rounded-tr-sm"
              : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm"
          }`}
        >
          <div className="markdown-content prose prose-sm max-w-none">
            <ReactMarkdown
              components={{
                a: ({ node, ...props }) => {
                  const isInternal =
                    props.href?.startsWith("/") ||
                    props.href?.includes(window.location.host);
                  return (
                    <a
                      {...props}
                      className="text-indigo-600 hover:text-indigo-800 underline font-bold transition-colors inline-flex items-center gap-1 bg-indigo-50 px-1.5 py-0.5 rounded"
                      onClick={(e) => {
                        if (isInternal && props.href) {
                          e.preventDefault();
                          navigate(props.href);
                        }
                      }}
                      target={isInternal ? "_self" : "_blank"}
                      rel="noreferrer"
                    >
                      {props.children}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  );
                },
                p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed whitespace-pre-wrap">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-sm">{children}</li>,
                strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>
              }}
            >
              {msg.content}
            </ReactMarkdown>
          </div>
        </div>
        <p className="text-[9px] text-gray-400 mt-1 font-bold uppercase tracking-tight">
          {new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
};

const ChatWidget = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [aiMsgs, setAiMsgs] = useState<any[]>([
    {
      _id: "a1",
      sender: { role: "bot" },
      content: AI_RESPONSES.default,
      createdAt: new Date().toISOString(),
    },
  ]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [media, setMedia] = useState<{
    url: string;
    type: "image" | "video";
  } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMsgs, typing]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const { data } = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMedia(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Upload thất bại");
    } finally {
      setUploading(false);
    }
  };

  const handleSend = async () => {
    if (!text.trim() || sending) return;

    const userMsg = {
      _id: Date.now().toString(),
      sender: { _id: "me", role: "user" },
      content: text,
      createdAt: new Date().toISOString(),
    };
    const currentHistory = [...aiMsgs, userMsg];
    setAiMsgs(currentHistory);
    setText("");
    setTyping(true);
    try {
      const { data } = await api.post("/chat/ai", {
        message: text,
        history: currentHistory.slice(0, -1).slice(-10),
      });
      setAiMsgs((prev) => [...prev, data]);
    } catch (err) {
      toast.error("AI đang bận, vui lòng thử lại sau.");
    } finally {
      setTyping(false);
      setSending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
      >
        {open ? (
          <X className="w-6 h-6" />
        ) : (
          <Bot className="w-6 h-6 group-hover:animate-bounce" />
        )}
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      {open && (
        <div
          className={`fixed right-5 z-50 bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden transition-all duration-300 ${
            expanded ? "w-96 h-[600px]" : "w-80 h-[480px]"
          }`}
          style={{ bottom: "85px" }}
        >
          {/* Header */}
          <div className="bg-violet-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/30 backdrop-blur-sm">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-sm leading-none">AI Assistant</p>
                  <p className="text-[10px] text-violet-100 mt-1 font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    Sẵn sàng tư vấn
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  {expanded ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-gray-50/50 custom-scrollbar">
            {aiMsgs.map((msg) => {
              const isMe = msg.sender?._id === "me" || msg.sender === "me";
              return <Bubble key={msg._id} msg={msg} isMe={isMe} />;
            })}
            {typing && (
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-2 flex items-center gap-1 shadow-sm">
                  <span
                    className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-100">
            {/* Media Preview (Optional for AI if supported later) */}
            {media && (
              <div className="mb-2 flex items-center gap-2 p-1.5 bg-gray-50 rounded-xl relative group w-fit">
                <img
                  src={`${BACKEND}${media.url}`}
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <button
                  onClick={() => setMedia(null)}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl focus-within:bg-white focus-within:ring-2 focus-within:ring-violet-500/10 transition-all border border-transparent focus-within:border-violet-100">
              <label className="p-1.5 text-gray-400 hover:text-violet-600 cursor-pointer transition-colors shrink-0">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Paperclip className="w-4 h-4" />
                )}
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Hỏi AI về sản phẩm..."
                rows={1}
                className="flex-1 bg-transparent border-none rounded-xl px-3 py-1.5 text-sm focus:ring-0 outline-none resize-none font-medium max-h-24"
              />
              <button
                onClick={handleSend}
                disabled={(!text.trim() && !media) || sending || uploading}
                className="w-10 h-10 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-200 text-white rounded-xl transition-all flex items-center justify-center shrink-0 shadow-lg shadow-violet-200"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
