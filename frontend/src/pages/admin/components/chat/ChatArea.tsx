import { Circle, PlayCircle, X, Loader2, Paperclip, Send } from "lucide-react";
import { Conversation, User } from "./types";
import { RefObject } from "react";

const BACKEND = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

interface ChatAreaProps {
  detail: Conversation | null;
  admin: User | null;
  input: string;
  setInput: (v: string) => void;
  media: { url: string; type: "image" | "video" } | null;
  setMedia: (m: { url: string; type: "image" | "video" } | null) => void;
  uploading: boolean;
  sending: boolean;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSend: () => void;
  chatRef: RefObject<HTMLDivElement>;
}

const ChatArea = ({
  detail,
  admin,
  input,
  setInput,
  media,
  setMedia,
  uploading,
  sending,
  handleFileUpload,
  handleSend,
  chatRef,
}: ChatAreaProps) => {
  if (!detail) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-200 bg-gray-50/10">
        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-sm border border-gray-100 mb-6">
          <Send className="w-10 h-10 text-gray-300 -rotate-12" />
        </div>
        <h3 className="text-gray-900 font-black text-xl">Chào mừng trở lại!</h3>
        <p className="text-gray-400 text-sm mt-1 font-medium">
          Chọn một cuộc trò chuyện để bắt đầu trả lời khách hàng
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white">
      {/* Chat header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/10">
        <div className="flex items-center gap-3">
          <div className="relative">
            {detail.participants.find((p) => p._id !== admin?.id)?.avatar ? (
              <img
                src={`${BACKEND}${
                  detail.participants.find((p) => p._id !== admin?.id)?.avatar
                }`}
                className="w-10 h-10 rounded-2xl object-cover"
                alt=""
              />
            ) : (
              <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-2xl flex items-center justify-center font-bold text-xs uppercase">
                {detail.participants
                  .find((p) => p._id !== admin?.id)
                  ?.name?.slice(0, 2) || "KH"}
              </div>
            )}
            <Circle className="absolute -bottom-1 -right-1 w-3.5 h-3.5 text-green-500 fill-green-500 border-2 border-white" />
          </div>
          <div>
            <p className="font-extrabold text-gray-900">
              {detail.participants.find((p) => p._id !== admin?.id)?.name}
            </p>
            <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">
              Đang trực tuyến
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/20 custom-scrollbar"
      >
        {detail.messages.map((m, i) => {
          const senderId = m.sender?._id || m.sender;
          const isMe = senderId === admin?.id;
          return (
            <div
              key={i}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-5 py-3.5 shadow-sm ${
                  isMe
                    ? "bg-primary-600 text-white rounded-tr-sm shadow-primary-50"
                    : "bg-white border border-gray-100 text-gray-900 rounded-tl-sm"
                }`}
              >
                {m.mediaUrl && (
                  <div className="mb-2 max-w-xs overflow-hidden rounded-lg cursor-pointer">
                    {m.mediaType === "video" ? (
                      <video
                        src={`${BACKEND}${m.mediaUrl}`}
                        controls
                        className="w-full max-h-60"
                      />
                    ) : (
                      <img
                        src={`${BACKEND}${m.mediaUrl}`}
                        alt="Attachment"
                        className="w-full object-cover max-h-60"
                        onClick={() =>
                          window.open(`${BACKEND}${m.mediaUrl}`, "_blank")
                        }
                      />
                    )}
                  </div>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {m.content}
                </p>
                <p
                  className={`text-[9px] mt-2 font-bold uppercase tracking-wider ${
                    isMe ? "text-primary-200" : "text-gray-400"
                  }`}
                >
                  {new Date(m.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {isMe && <span className="ml-1 opacity-60">✓✓</span>}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-5 border-t border-gray-100 bg-white">
        {/* Media Preview */}
        {media && (
          <div className="mb-3 flex items-center gap-3 p-2 bg-gray-50 rounded-xl relative group w-fit">
            {media.type === "video" ? (
              <div className="w-20 h-20 bg-black rounded-lg flex items-center justify-center text-white">
                <PlayCircle />
              </div>
            ) : (
              <img
                src={`${BACKEND}${media.url}`}
                className="w-20 h-20 object-cover rounded-lg"
              />
            )}
            <button
              onClick={() => setMedia(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-3 bg-gray-100 p-2 rounded-2xl border border-transparent focus-within:border-primary-100 focus-within:bg-white transition-all">
          <label className="p-2 text-gray-400 hover:text-primary-600 cursor-pointer transition-colors shrink-0">
            <input
              type="file"
              className="hidden"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Paperclip className="w-4 h-4" />
            )}
          </label>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Nhập tin nhắn tại đây..."
            className="flex-1 bg-transparent border-none rounded-xl px-4 py-2 text-sm focus:ring-0 outline-none font-medium"
          />
          <button
            onClick={handleSend}
            disabled={(!input.trim() && !media) || sending || uploading}
            className="w-11 h-11 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-200 text-white rounded-xl flex items-center justify-center transition-all shrink-0 shadow-lg shadow-primary-200 active:scale-95"
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
  );
};

export default ChatArea;
