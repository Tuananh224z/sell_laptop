import { useState } from "react";
import { X, Eye, EyeOff, KeyRound } from "lucide-react";
import api from "../../../../config/Axios";
import { User } from "./types";

const ResetPasswordModal = ({
  user,
  onClose,
}: {
  user: User;
  onClose: () => void;
}) => {
  const [pwd, setPwd] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    if (pwd.length < 6) {
      setError("Mật khẩu phải ít nhất 6 ký tự");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.patch(`/users/${user._id}/reset-password`, {
        newPassword: pwd,
      });
      setSuccess(true);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Lỗi",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-extrabold text-gray-900">Đặt lại mật khẩu</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {success ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <KeyRound className="w-7 h-7 text-green-600" />
              </div>
              <p className="font-semibold text-gray-900">
                Đặt lại mật khẩu thành công!
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Mật khẩu mới đã được cập nhật cho <strong>{user.name}</strong>
              </p>
              <button
                onClick={onClose}
                className="mt-4 bg-primary-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold"
              >
                Đóng
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                Đặt lại mật khẩu cho: <strong>{user.name}</strong>
              </p>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-xl">
                  {error}
                </div>
              )}
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  placeholder="Mật khẩu mới (ít nhất 6 ký tự)"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {show ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-700"
                >
                  Huỷ
                </button>
                <button
                  onClick={save}
                  disabled={loading || !pwd}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 text-white rounded-xl py-2.5 text-sm font-semibold"
                >
                  {loading ? "Đang lưu..." : "Xác nhận"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
