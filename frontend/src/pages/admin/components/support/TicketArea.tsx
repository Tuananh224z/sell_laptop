import { X, Send, Paperclip, Loader2, PlayCircle, MessageCircle } from "lucide-react";
import { RefObject } from "react";
import { Ticket } from "./types";

const BACKEND =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

interface TicketAreaProps {
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  detail: Ticket | null;
  handleStatusChange: (s: string) => void;
  chatRef: RefObject<HTMLDivElement>;
  media: { url: string; type: "image" | "video" } | null;
  setMedia: (m: any) => void;
  uploading: boolean;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  reply: string;
  setReply: (s: string) => void;
  sendReply: () => void;
  sending: boolean;
}

const TicketArea = ({
  selectedId,
  setSelectedId,
  detail,
  handleStatusChange,
  chatRef,
  media,
  setMedia,
  uploading,
  handleFileUpload,
  reply,
  setReply,
  sendReply,
  sending,
}: TicketAreaProps) => {
  return (
    <div
      className={`${selectedId ? "flex" : "hidden lg:flex"} lg:col-span-3 flex-col bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden`}
    >
      {detail ? (
        <>
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/30">
            <button
              onClick={() => setSelectedId(null)}
              className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-gray-200 text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <h3 className="font-extrabold text-gray-900 truncate">
                {detail.subject}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                {detail.user?.avatar ? (
                  <img
                    src={`${BACKEND}${detail.user.avatar}`}
                    className="w-5 h-5 rounded-full object-cover"
                    alt=""
                  />
                ) : (
                  <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center text-[8px] font-bold text-primary-700">
                    {(detail.user?.name || "U")[0]}
                  </div>
                )}
                <p className="text-xs text-gray-500 font-medium">
                  {detail.user?.name}{" "}
                  <span className="text-gray-300 mx-1">|</span>{" "}
                  {detail.user?.email}
                </p>
              </div>
            </div>
            <select
              value={detail.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold bg-white focus:ring-2 focus:ring-primary-500/20 outline-none transition-all cursor-pointer shadow-sm"
            >
              <option value="open">Mở</option>
              <option value="processing">Đang xử lý</option>
              <option value="resolved">Đã giải quyết</option>
              <option value="closed">Đóng</option>
            </select>
          </div>

          {/* Messages */}
          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/20 custom-scrollbar"
          >
            {/* Initial content */}
            <div className="flex justify-start">
              {detail.user?.avatar ? (
                <img
                  src={`${BACKEND}${detail.user.avatar}`}
                  className="w-8 h-8 rounded-full object-cover shrink-0 mr-3 mt-1 shadow-sm border border-white"
                  alt=""
                />
              ) : (
                <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mr-3 mt-1 uppercase">
                  {detail.user?.name?.slice(0, 2) || "KH"}
                </div>
              )}
              <div className="max-w-[85%] bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {detail.content}
                </p>
                <p className="text-[10px] mt-2 font-bold text-gray-400 uppercase tracking-tight">
                  {new Date(detail.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
            </div>

            {detail.messages.slice(1).map((msg, i) => {
              const isStaff = msg.sender?.role === "admin";
              return (
                <div
                  key={i}
                  className={`flex ${isStaff ? "justify-end" : "justify-start"}`}
                >
                  {!isStaff &&
                    (detail.user?.avatar ? (
                      <img
                        src={`${BACKEND}${detail.user.avatar}`}
                        className="w-8 h-8 rounded-full object-cover shrink-0 mr-3 mt-1 shadow-sm border border-white"
                        alt=""
                      />
                    ) : (
                      <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mr-3 mt-1 uppercase">
                        {detail.user?.name?.slice(0, 2) || "KH"}
                      </div>
                    ))}
                  <div
                    className={`max-w-[80%] ${isStaff ? "bg-primary-600 text-white rounded-2xl rounded-tr-sm shadow-md shadow-primary-100" : "bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm shadow-sm"} px-5 py-3.5`}
                  >
                    {msg.mediaUrl && (
                      <div className="mb-2 max-w-xs overflow-hidden rounded-lg cursor-pointer">
                        {msg.mediaType === "video" ? (
                          <video
                            src={`${BACKEND}${msg.mediaUrl}`}
                            controls
                            className="w-full max-h-60"
                          />
                        ) : (
                          <img
                            src={`${BACKEND}${msg.mediaUrl}`}
                            alt="Attachment"
                            className="w-full object-cover max-h-60"
                            onClick={() =>
                              window.open(
                                `${BACKEND}${msg.mediaUrl}`,
                                "_blank",
                              )
                            }
                          />
                        )}
                      </div>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                    <p
                      className={`text-[9px] mt-2 font-bold uppercase tracking-wider ${isStaff ? "text-primary-200" : "text-gray-400"}`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {isStaff && (
                        <span className="ml-2 opacity-60">✓✓</span>
                      )}
                    </p>
                  </div>
                  {isStaff &&
                    (msg.sender?.avatar ? (
                      <img
                        src={`${BACKEND}${msg.sender.avatar}`}
                        className="w-8 h-8 rounded-full object-cover shrink-0 ml-3 mt-1 shadow-sm border border-white"
                        alt=""
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ml-3 mt-1">
                        AD
                      </div>
                    ))}
                </div>
              );
            })}
          </div>

          {/* Reply */}
          <div className="border-t border-gray-100 p-4 bg-white">
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

            <div className="flex items-end gap-3 bg-gray-50 rounded-2xl p-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-500/10 transition-all border border-transparent focus-within:border-primary-100">
              <label className="p-2 text-gray-400 hover:text-primary-600 cursor-pointer transition-colors shrink-0">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                {uploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Paperclip className="w-5 h-5" />
                )}
              </label>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendReply();
                  }
                }}
                placeholder="Nhập phản hồi tại đây..."
                rows={2}
                className="flex-1 bg-transparent border-none rounded-xl px-3 py-2 text-sm focus:ring-0 outline-none resize-none min-h-[45px] max-h-[150px] font-medium"
              />
              <button
                onClick={sendReply}
                disabled={(!reply.trim() && !media) || sending || uploading}
                className="w-10 h-10 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-200 text-white rounded-xl transition-all flex items-center justify-center shrink-0 shadow-lg shadow-primary-200 active:scale-95"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 px-2 font-medium">
              Nhấn <strong>Enter</strong> để gửi nhanh,{" "}
              <strong>Shift+Enter</strong> để xuống dòng.
            </p>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-200 p-10 bg-gray-50/30">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-6">
            <MessageCircle className="w-12 h-12 text-gray-300" />
          </div>
          <h4 className="text-gray-900 font-extrabold text-lg">
            Hộp thư hỗ trợ
          </h4>
          <p className="text-gray-400 text-sm mt-1 font-medium">
            Chọn một yêu cầu bên trái để bắt đầu hỗ trợ khách hàng
          </p>
        </div>
      )}
    </div>
  );
};

export default TicketArea;
