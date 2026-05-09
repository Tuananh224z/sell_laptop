import { useState, useRef, useEffect } from "react";
import {
  Search,
  X,
  Send,
  MessageCircle,
  Loader2,
  Paperclip,
  PlayCircle,
} from "lucide-react";
import api from "../../config/Axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { io } from "socket.io-client";

const BACKEND =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

interface Message {
  sender: {
    _id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  content?: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  createdAt: string;
  isRead: boolean;
}

interface Ticket {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  subject: string;
  content: string;
  status: "open" | "processing" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  messages: Message[];
  lastMessageAt: string;
  createdAt: string;
}

const priorityStyle: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-gray-100 text-gray-600",
};
const statusStyle: Record<string, string> = {
  open: "bg-blue-100 text-blue-700",
  processing: "bg-amber-100 text-amber-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-500",
};
const statusLabel: Record<string, string> = {
  open: "Mở",
  processing: "Đang xử lý",
  resolved: "Đã giải quyết",
  closed: "Đóng",
};

const AdminSupport = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Ticket | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [media, setMedia] = useState<{
    url: string;
    type: "image" | "video";
  } | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  // Init socket
  useEffect(() => {
    socketRef.current = io(BACKEND);
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (selectedId && socketRef.current) {
      socketRef.current.emit("join_room", selectedId);

      const handleNewMessage = (msg: Message) => {
        setDetail((prev) => {
          if (!prev) return prev;
          const exists = prev.messages.some(
            (m) =>
              m.createdAt === msg.createdAt && m.sender._id === msg.sender._id,
          );
          if (exists) return prev;
          return { ...prev, messages: [...prev.messages, msg] };
        });
        // Update unread in list
        setTickets((prev) =>
          prev.map((t) =>
            t._id === selectedId ? { ...t, lastMessageAt: msg.createdAt } : t,
          ),
        );
      };

      socketRef.current.on("new_message", handleNewMessage);
      return () => {
        socketRef.current.off("new_message", handleNewMessage);
      };
    }
  }, [selectedId]);

  useEffect(() => {
    if (socketRef.current) {
      const handleNewTicket = (ticket: Ticket) => {
        setTickets((prev) => {
          const exists = prev.some((t) => t._id === ticket._id);
          if (exists) return prev;
          return [ticket, ...prev];
        });
        toast.info(`Có yêu cầu hỗ trợ mới: ${ticket.subject}`);
      };

      socketRef.current.on("new_ticket", handleNewTicket);
      return () => {
        socketRef.current.off("new_ticket", handleNewTicket);
      };
    }
  }, []);

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

  const fetchTickets = async () => {
    try {
      const { data } = await api.get("/support/admin/all", {
        params: { status: statusFilter, search },
      });
      setTickets(data);
    } catch (err) {
      toast.error("Lỗi tải danh sách yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (id: string) => {
    try {
      const { data } = await api.get(`/support/admin/${id}`);
      setDetail(data);
      // Update unread count in list locally
      setTickets((prev) =>
        prev.map((t) => (t._id === id ? { ...t, messages: data.messages } : t)),
      );
    } catch (err) {
      toast.error("Lỗi tải chi tiết yêu cầu");
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, search]);

  useEffect(() => {
    if (selectedId) {
      fetchDetail(selectedId);
    } else {
      setDetail(null);
    }
  }, [selectedId]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [detail?.messages]);

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedId) return;
    try {
      const { data } = await api.patch(`/support/admin/${selectedId}/status`, {
        status: newStatus,
      });
      setDetail((prev) => (prev ? { ...prev, status: data.status } : null));
      setTickets((prev) =>
        prev.map((t) =>
          t._id === selectedId ? { ...t, status: data.status } : t,
        ),
      );
      toast.success("Đã cập nhật trạng thái");
    } catch (err) {
      toast.error("Lỗi cập nhật trạng thái");
    }
  };

  const sendReply = async () => {
    if ((!reply.trim() && !media) || !selectedId || sending) return;
    setSending(true);
    try {
      await api.post(`/support/${selectedId}/reply`, {
        content: reply,
        mediaUrl: media?.url,
        mediaType: media?.type,
      });
      setReply("");
      setMedia(null);
      setTickets((prev) =>
        prev.map((t) =>
          t._id === selectedId
            ? { ...t, lastMessageAt: new Date().toISOString() }
            : t,
        ),
      );
    } catch (err) {
      toast.error("Gửi phản hồi thất bại");
    } finally {
      setSending(false);
    }
  };

  const getUnreadCount = (ticket: Ticket) => {
    return ticket.messages.filter(
      (m) => m.sender?._id !== user?.id && !m.isRead,
    ).length;
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Hỗ trợ khách hàng
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Quản lý yêu cầu hỗ trợ trực tuyến
          </p>
        </div>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl border border-gray-200">
          {["all", "open", "processing", "resolved"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${statusFilter === s ? "bg-white text-primary-600 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
            >
              {s === "all" ? "Tất cả" : statusLabel[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Ticket list */}
        <div
          className={`${selectedId ? "hidden lg:flex" : "flex"} lg:col-span-2 flex-col bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden`}
        >
          <div className="p-5 border-b border-gray-100 bg-gray-50/30">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm tiêu đề, khách hàng..."
                className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-2xl text-sm w-full focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50 custom-scrollbar">
            {loading ? (
              <div className="p-10 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-500" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="p-10 text-center text-gray-400 text-sm">
                Không có yêu cầu nào
              </div>
            ) : (
              tickets.map((t) => {
                const unread = getUnreadCount(t);
                return (
                  <button
                    key={t._id}
                    onClick={() => setSelectedId(t._id)}
                    className={`w-full text-left px-5 py-5 hover:bg-gray-50 transition-all border-l-4 ${selectedId === t._id ? "bg-primary-50/50 border-primary-500" : "border-transparent"}`}
                  >
                    <div className="flex gap-4">
                      <div className="shrink-0 mt-1">
                        {t.user?.avatar ? (
                          <img
                            src={`${BACKEND}${t.user.avatar}`}
                            className="w-10 h-10 rounded-2xl object-cover shadow-sm border border-white"
                            alt=""
                          />
                        ) : (
                          <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-2xl flex items-center justify-center font-bold text-xs uppercase">
                            {t.user?.name?.slice(0, 2) || "CU"}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-bold text-gray-900 text-sm line-clamp-1">
                            {t.subject}
                          </p>
                          {unread > 0 && (
                            <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                              {unread}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 mb-2 font-medium">
                          {t.user?.name} ·{" "}
                          <span className="text-gray-400">
                            {new Date(t.createdAt).toLocaleDateString("vi-VN")}
                          </span>
                        </p>
                        <div className="flex gap-2">
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusStyle[t.status]}`}
                          >
                            {statusLabel[t.status]}
                          </span>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${priorityStyle[t.priority]}`}
                          >
                            {t.priority === "high"
                              ? "Cao"
                              : t.priority === "medium"
                                ? "Trung"
                                : "Thấp"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Conversation */}
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
      </div>
    </div>
  );
};

export default AdminSupport;
