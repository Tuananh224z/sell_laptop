import { Smartphone, AlertTriangle, XCircle } from "lucide-react";

interface InventoryStatsProps {
  total: number;
  lowStockCount: number;
  outOfStockCount: number;
}

const InventoryStats = ({
  total,
  lowStockCount,
  outOfStockCount,
}: InventoryStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
          <Smartphone className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Tổng sản phẩm</p>
          <p className="text-2xl font-bold text-gray-900">{total}</p>
        </div>
      </div>
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Sắp hết hàng</p>
          <p className="text-2xl font-bold text-gray-900">{lowStockCount}</p>
        </div>
      </div>
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
          <XCircle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Hết hàng</p>
          <p className="text-2xl font-bold text-gray-900">{outOfStockCount}</p>
        </div>
      </div>
    </div>
  );
};

export default InventoryStats;
