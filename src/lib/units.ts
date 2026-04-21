export type UnitIconKey = "integration" | "applications" | "vectors" | "complex" | "generic";

export function resolveUnitIconKey(unit: { iconKey?: string | null; number: number }): UnitIconKey {
  if (unit.iconKey) {
    const k = unit.iconKey as UnitIconKey;
    if (["integration", "applications", "vectors", "complex"].includes(k)) return k;
  }
  switch (unit.number) {
    case 4:
      return "integration";
    case 5:
      return "applications";
    case 6:
      return "vectors";
    case 7:
      return "complex";
    default:
      return "generic";
  }
}

export const UNIT_TAGLINE_AR: Record<UnitIconKey, string> = {
  integration: "التكامل",
  applications: "تطبيقات التكامل",
  vectors: "المتّجهات في الفضاء",
  complex: "الأعداد المركّبة",
  generic: "وحدة دراسية",
};
