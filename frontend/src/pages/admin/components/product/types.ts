export type ImageItem = { id: string; url: string; file?: File; isPrimary: boolean; isNew: boolean };
export type VideoItem = { id: string; url: string; file?: File; isNew: boolean };
export type SpecItem = { id: string; key: string; value: string };
export type SpecGroup = { id: string; name: string; items: SpecItem[] };
export type Attribute = { id: string; name: string; values: string[] };
export type Serial = { _id?: string; id: string; code: string; status: 'available'|'sold'|'defective'|'reserved'; note: string };
export type Variant = { _id?: string; id: string; label: string; combo: Record<string,string>; origPrice: string; salePrice: string; sku: string; isDefault: boolean; serials: Serial[] };
