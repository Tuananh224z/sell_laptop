export interface Message {
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

export interface Ticket {
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

export const priorityStyle: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-gray-100 text-gray-600",
};

export const statusStyle: Record<string, string> = {
  open: "bg-blue-100 text-blue-700",
  processing: "bg-amber-100 text-amber-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-500",
};

export const statusLabel: Record<string, string> = {
  open: "Mở",
  processing: "Đang xử lý",
  resolved: "Đã giải quyết",
  closed: "Đóng",
};
