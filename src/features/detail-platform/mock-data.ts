export const PLATFORM_TREND: Record<"meta" | "tiktok", { day: string; spend: number; closing: number }[]> = {
  meta: [
    { day: "1", spend: 340, closing: 5 },
    { day: "2", spend: 360, closing: 5 },
    { day: "3", spend: 355, closing: 6 },
    { day: "4", spend: 380, closing: 6 },
    { day: "5", spend: 395, closing: 7 },
    { day: "6", spend: 410, closing: 7 },
    { day: "7", spend: 430, closing: 8 },
  ],
  tiktok: [
    { day: "1", spend: 210, closing: 3 },
    { day: "2", spend: 230, closing: 3 },
    { day: "3", spend: 260, closing: 4 },
    { day: "4", spend: 290, closing: 3 },
    { day: "5", spend: 330, closing: 3 },
    { day: "6", spend: 360, closing: 4 },
    { day: "7", spend: 400, closing: 4 },
  ],
};

export const PLATFORM_CHART_COLOR: Record<"meta" | "tiktok", string> = {
  meta: "#f0b400",
  tiktok: "#4f8cff",
};
