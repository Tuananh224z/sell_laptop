export interface Serial {
  _id: string;
  code: string;
  status: "available" | "sold" | "defective" | "reserved";
  note: string;
}

export interface Product {
  _id: string;
  name: string;
  sku: string;
  thumbnail: string;
  category: { _id: string; name: string } | null;
  stock: number;
  hasVariants: boolean;
  variants: any[];
  serials: Serial[];
}

export interface HistoryItem {
  _id: string;
  product: { _id: string; name: string; thumbnail: string; sku: string };
  type: "import" | "export" | "return" | "adjustment";
  quantity: number;
  serials: string[];
  note: string;
  createdBy: { name: string };
  createdAt: string;
}
