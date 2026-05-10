import { useState, useEffect, useRef } from "react";
import api from "../../config/Axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { io } from "socket.io-client";
import { Conversation } from "./components/chat/types";
import ChatSidebar from "./components/chat/ChatSidebar";
import ChatArea from "./components/chat/ChatArea";

const BACKEND =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const AdminChat = () => {
  const { user: admin } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Conversation | null>(null);
  const [input, setInput] = useState("");
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

      const handleNewMessage = (msg: any) => {
        setDetail((prev) => {
          if (!prev) return prev;
          const exists = prev.messages.some((m) => m._id === msg._id);
          if (exists) return prev;
          return { ...prev, messages: [...prev.messages, msg] };
        });
        // Update unread in list
        setConversations((prev) =>
          prev.map((c) => {
            if (c._id === selectedId) {
              const exists = c.messages.some((m) => m._id === msg._id);
              return {
                ...c,
                messages: exists ? c.messages : [...c.messages, msg],
                lastMessage: {
                  ...msg,
                  sender:
                    typeof msg.sender === "string"
                      ? msg.sender
                      : msg.sender._id,
                },
              };
            }
            return c;
          })
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
      const handleAdminNewMessage = ({ conversationId, message }: any) => {
        setConversations((prev) => {
          const conv = prev.find((c) => c._id === conversationId);
          if (!conv) return prev;

          const otherConvs = prev.filter((c) => c._id !== conversationId);
          const updatedConv = {
            ...conv,
            lastMessage: message,
            messages: conv.messages.some((m) => m._id === message._id)
              ? conv.messages
              : [...conv.messages, message],
          };
          return [updatedConv, ...otherConvs];
        });

        if (conversationId !== selectedId) {
          toast.info(`Tin nhắn mới từ ${message.sender?.name || "Khách hàng"}`);
        }
      };

      const handleNewConversation = (conv: any) => {
        setConversations((prev) => {
          if (prev.some((c) => c._id === conv._id)) return prev;
          return [conv, ...prev];
        });
        toast.success(`Hội thoại mới bắt đầu!`);
      };

      socketRef.current.on("admin_new_message", handleAdminNewMessage);
      socketRef.current.on("new_conversation", handleNewConversation);

      return () => {
        socketRef.current.off("admin_new_message", handleAdminNewMessage);
        socketRef.current.off("new_conversation", handleNewConversation);
      };
    }
  }, [selectedId]);

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

  const fetchConversations = async () => {
    try {
      const { data } = await api.get("/chat/admin/all");
      setConversations(data);
    } catch (err) {
      toast.error("Lỗi tải danh sách hội thoại");
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (id: string) => {
    try {
      const { data } = await api.get(`/chat/${id}`);
      setDetail(data);
      setConversations((prev) =>
        prev.map((c) => (c._id === id ? { ...c, messages: data.messages } : c))
      );
    } catch (err) {
      toast.error("Lỗi tải chi tiết tin nhắn");
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

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

  const handleSend = async () => {
    if ((!input.trim() && !media) || !selectedId || sending) return;
    setSending(true);
    try {
      await api.post(`/chat/${selectedId}/send`, {
        content: input,
        mediaUrl: media?.url,
        mediaType: media?.type,
      });
      setInput("");
      setMedia(null);
    } catch (err) {
      toast.error("Không thể gửi tin nhắn");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 h-[calc(100vh-56px)] flex flex-col">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Tin nhắn</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Quản lý chat trực tuyến với khách hàng
          </p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex min-h-0">
        <ChatSidebar
          conversations={conversations}
          loading={loading}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          admin={admin as any}
        />

        <ChatArea
          detail={detail}
          admin={admin as any}
          input={input}
          setInput={setInput}
          media={media}
          setMedia={setMedia}
          uploading={uploading}
          sending={sending}
          handleFileUpload={handleFileUpload}
          handleSend={handleSend}
          chatRef={chatRef}
        />
      </div>
    </div>
  );
};

export default AdminChat;
