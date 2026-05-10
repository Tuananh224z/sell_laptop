import { Search, Loader2, Circle } from "lucide-react";
import { Conversation, User } from "./types";
import { useState } from "react";

const BACKEND = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

interface ChatSidebarProps {
  conversations: Conversation[];
  loading: boolean;
  selectedId: string | null;
  setSelectedId: (id: string) => void;
  admin: User | null;
}

const ChatSidebar = ({
  conversations,
  loading,
  selectedId,
  setSelectedId,
  admin,
}: ChatSidebarProps) => {
  const [search, setSearch] = useState("");

  const filtered = (conversations || []).filter((c) => {
    if (!c.participants) return false;
    const other = c.participants.find((p) => p && p._id !== admin?.id);
    return (other?.name || "").toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="w-80 border-r border-gray-100 flex flex-col shrink-0 bg-gray-50/20">
      <div className="p-4 border-b border-gray-100 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm khách hàng..."
            className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-2xl text-sm w-full focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-gray-400 text-sm">
            Chưa có hội thoại nào
          </div>
        ) : (
          filtered.map((c) => {
            const other = (c.participants || []).find(
              (p) => p && p._id !== admin?.id
            );
            const unreadCount = (c.messages || []).filter((m) => {
              if (!m.sender) return false;
              const sId =
                typeof m.sender === "object" ? m.sender._id : m.sender;
              return sId !== admin?.id && !m.isRead;
            }).length;
            return (
              <button
                key={c._id}
                onClick={() => setSelectedId(c._id)}
                className={`w-full flex items-center gap-4 p-4 text-left hover:bg-white transition-all border-l-4 ${
                  selectedId === c._id
                    ? "bg-white border-primary-500 shadow-sm"
                    : "border-transparent"
                }`}
              >
                <div className="relative shrink-0">
                  {other?.avatar ? (
                    <img
                      src={`${BACKEND}${other.avatar}`}
                      className="w-12 h-12 rounded-2xl object-cover"
                      alt=""
                    />
                  ) : (
                    <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-2xl flex items-center justify-center font-bold text-sm uppercase">
                      {other?.name?.slice(0, 2) || "KH"}
                    </div>
                  )}
                  <Circle className="absolute -bottom-1 -right-1 w-4 h-4 text-green-500 fill-green-500 border-2 border-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-gray-900 text-sm truncate">
                      {c.participants.find((p) => p._id !== admin?.id)?.name}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">
                      {c.lastMessage
                        ? new Date(c.lastMessage.createdAt).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : ""}
                    </span>
                  </div>
                  <p
                    className={`text-xs truncate ${
                      unreadCount > 0
                        ? "text-gray-900 font-bold"
                        : "text-gray-500"
                    }`}
                  >
                    {c.lastMessage?.content || "Bắt đầu trò chuyện..."}
                  </p>
                </div>
                {unreadCount > 0 && (
                  <span className="w-5 h-5 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-primary-100">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
