import { Attribute, Variant } from "./types";

export const uid = () => Math.random().toString(36).slice(2, 8);

export function cartesian(attrs: Attribute[]): Record<string, string>[] {
  const valid = attrs.filter((a) => a.values.length > 0);
  if (!valid.length) return [];
  return valid.reduce<Record<string, string>[]>((acc, attr) => {
    if (!acc.length) return attr.values.map((v) => ({ [attr.name]: v }));
    return acc.flatMap((combo) =>
      attr.values.map((v) => ({ ...combo, [attr.name]: v }))
    );
  }, []);
}

export function syncVariants(
  attrs: Attribute[],
  existing: Variant[]
): Variant[] {
  const combos = cartesian(attrs);
  if (!combos.length) return [];
  return combos.map((combo) => {
    const label = Object.values(combo).join(" / ");
    return (
      existing.find((v) => v.label === label) ?? {
        id: uid(),
        label,
        combo,
        origPrice: "",
        salePrice: "",
        sku: "",
        isDefault: false,
        serials: [],
      }
    );
  });
}
