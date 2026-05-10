import { Search, Loader2 } from "lucide-react";
import { Ticket, statusStyle, statusLabel, priorityStyle } from "./types";

const BACKEND =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

interface TicketSidebarProps {
  search: string;
  setSearch: (val: string) => void;
  loading: boolean;
  tickets: Ticket[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  getUnreadCount: (t: Ticket) => number;
}

const TicketSidebar = ({
  search,
  setSearch,
  loading,
  tickets,
  selectedId,
  setSelectedId,
  getUnreadCount,
}: TicketSidebarProps) => {
  return (
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
  );
};

export default TicketSidebar;
