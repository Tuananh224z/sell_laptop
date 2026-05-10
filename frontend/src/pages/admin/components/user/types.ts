export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "admin";
  isActive: boolean;
  createdAt: string;
  initials: string;
  avatar?: string;
}
