/** Repertoire categories matching the PDF structure */
export type RepertoireCategory = "all" | "stranski" | "ex-yu" | "makedonski" | "turbo" | "extras";

export const CATEGORY_COLORS: Record<
  Exclude<RepertoireCategory, "all">,
  { bg: string; bgActive: string; text: string; ribbon: string }
> = {
  stranski: { bg: "bg-blue-100", bgActive: "bg-blue-500", text: "text-blue-800", ribbon: "bg-blue-500" },
  "ex-yu": { bg: "bg-red-100", bgActive: "bg-red-500", text: "text-red-800", ribbon: "bg-red-500" },
  makedonski: {
    bg: "bg-amber-100",
    bgActive: "bg-amber-500",
    text: "text-amber-900",
    ribbon: "bg-amber-500",
  },
  turbo: {
    bg: "bg-orange-100",
    bgActive: "bg-orange-500",
    text: "text-orange-900",
    ribbon: "bg-orange-500",
  },
  extras: {
    bg: "bg-slate-200",
    bgActive: "bg-slate-600",
    text: "text-slate-800",
    ribbon: "bg-slate-500",
  },
};

export const REPERTOIRE_CATEGORIES: { value: RepertoireCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: "stranski", label: "Stranski" },
  { value: "ex-yu", label: "EX-YU" },
  { value: "makedonski", label: "Makedonski" },
  { value: "turbo", label: "Turbo" },
  { value: "extras", label: "Extras" },
];
