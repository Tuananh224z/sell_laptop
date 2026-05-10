export interface User {
  _id: string;
  name: string;
  avatar?: string;
  role: string;
  id?: string;
}

export interface Message {
  _id: string;
  sender: User | string | any;
  content?: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  createdAt: string;
  isRead: boolean;
}

export interface Conversation {
  _id: string;
  participants: User[];
  lastMessage?: {
    sender: string | any;
    content?: string;
    mediaUrl?: string;
    mediaType?: "image" | "video";
    createdAt: string;
  };
  messages: Message[];
  updatedAt: string;
}
