import { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import api from "../../../../config/Axios";
import { User } from "./types";

const UserModal = ({
  user,
  onClose,
  onSaved,
}: {
  user: User | null;
  onClose: () => void;
  onSaved: () => void;
}) => {
  const isEdit = !!user;
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    role: user?.role ?? "user",
    password: "",
    isActive: user?.isActive ?? true,
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k: string, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setError("");
    if (!form.name || !form.email) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (!isEdit && !form.password) {
      setError("Vui lòng nhập mật khẩu");
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/users/${user!._id}`, {
          name: form.name,
          phone: form.phone,
          role: form.role,
          isActive: form.isActive,
        });
      } else {
        await api.post("/users", {
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          role: form.role,
        });
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Có lỗi xảy ra",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="font-extrabold text-gray-900">
            {isEdit ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-xl">
              {error}
            </div>
          )}
          {[
            {
              label: "Họ và tên *",
              key: "name",
              type: "text",
              placeholder: "Nguyễn Văn A",
            },
            {
              label: "Email *",
              key: "email",
              type: "email",
              placeholder: "user@example.com",
              disabled: isEdit,
            },
            {
              label: "Số điện thoại",
              key: "phone",
              type: "tel",
              placeholder: "0912 345 678",
            },
          ].map((f) => (
            <div key={f.key}>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                {f.label}
              </label>
              <input
                type={f.type}
                value={form[f.key as keyof typeof form] as string}
                onChange={(e) => set(f.key, e.target.value)}
                disabled={f.disabled}
                placeholder={f.placeholder}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-gray-100 disabled:text-gray-400"
              />
            </div>
          ))}

          {!isEdit && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Mật khẩu *
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="Ít nhất 6 ký tự"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPwd ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Vai trò
              </label>
              <select
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white"
              >
                <option value="user">Người dùng</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {isEdit && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Trạng thái
                </label>
                <select
                  value={String(form.isActive)}
                  onChange={(e) => set("isActive", e.target.value === "true")}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                >
                  <option value="true">Hoạt động</option>
                  <option value="false">Đã khóa</option>
                </select>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Huỷ
          </button>
          <button
            onClick={save}
            disabled={loading}
            className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2"
          >
            {loading && (
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            )}
            {isEdit ? "Lưu thay đổi" : "Tạo người dùng"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
