import { useState, useRef, useEffect } from "react";
import api from "../../config/Axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { io } from "socket.io-client";
import { Ticket, Message, statusLabel } from "./components/support/types";
import TicketSidebar from "./components/support/TicketSidebar";
import TicketArea from "./components/support/TicketArea";

const BACKEND =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

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
        <TicketSidebar
          search={search}
          setSearch={setSearch}
          loading={loading}
          tickets={tickets}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          getUnreadCount={getUnreadCount}
        />

        <TicketArea
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          detail={detail}
          handleStatusChange={handleStatusChange}
          chatRef={chatRef}
          media={media}
          setMedia={setMedia}
          uploading={uploading}
          handleFileUpload={handleFileUpload}
          reply={reply}
          setReply={setReply}
          sendReply={sendReply}
          sending={sending}
        />
      </div>
    </div>
  );
};

export default AdminSupport;
