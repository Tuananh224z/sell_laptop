export interface Promo {
  _id: string;
  code: string;
  name: string;
  type: "percentage" | "fixed" | "shipping";
  value: number;
  minOrderValue: number;
  usageLimit: number | null;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  maxDiscount?: number;
}
