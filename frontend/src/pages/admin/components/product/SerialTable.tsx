import { Plus, Trash2 } from "lucide-react";
import { Serial } from "./types";

const uid = () => Math.random().toString(36).slice(2, 8);

interface SerialTableProps {
  serials: Serial[];
  onChange: (s: Serial[]) => void;
}

export const SerialTable = ({ serials, onChange }: SerialTableProps) => {
  const add = () =>
    onChange([...serials, { id: uid(), code: "", status: "available", note: "" }]);
  const upd = (i: number, k: keyof Serial, v: string) =>
    onChange(serials.map((s, idx) => (idx === i ? { ...s, [k]: v } : s)));
  const del = (i: number) => onChange(serials.filter((_, idx) => idx !== i));
  
  const statusOpts: Serial["status"][] = [
    "available",
    "sold",
    "defective",
    "reserved",
  ];
  const statusLabel = {
    available: "Còn hàng",
    sold: "Đã bán",
    defective: "Lỗi",
    reserved: "Đã đặt",
  };
  const statusColor = {
    available: "bg-green-100 text-green-700",
    sold: "bg-red-100 text-red-600",
    defective: "bg-gray-100 text-gray-500",
    reserved: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-500 uppercase">
          Serial ({serials.length}) —{" "}
          {serials.filter((s) => s.status === "available").length} còn hàng
        </p>
        <button
          onClick={add}
          className="flex items-center gap-1 text-xs text-primary-600 font-semibold"
        >
          <Plus className="w-3 h-3" /> Thêm serial
        </button>
      </div>
      {serials.length > 0 && (
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2 font-semibold text-gray-500">
                  Mã serial
                </th>
                <th className="text-center px-3 py-2 font-semibold text-gray-500">
                  Trạng thái
                </th>
                <th className="text-left px-3 py-2 font-semibold text-gray-500">
                  Ghi chú
                </th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {serials.map((s, i) => (
                <tr key={s.id || s._id}>
                  <td className="px-3 py-2">
                    <input
                      value={s.code}
                      onChange={(e) => upd(i, "code", e.target.value)}
                      placeholder="VD: SN-ABC123"
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-primary-500 outline-none"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <select
                      value={s.status}
                      onChange={(e) => upd(i, "status", e.target.value)}
                      className={`text-xs font-semibold px-2 py-1 rounded-full border-0 outline-none cursor-pointer mx-auto ${
                        statusColor[s.status]
                      }`}
                    >
                      {statusOpts.map((o) => (
                        <option key={o} value={o}>
                          {statusLabel[o]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      value={s.note}
                      onChange={(e) => upd(i, "note", e.target.value)}
                      placeholder="Ghi chú..."
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-primary-500 outline-none"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => del(i)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
