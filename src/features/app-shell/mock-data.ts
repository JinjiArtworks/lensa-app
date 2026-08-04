export interface ActivityItem {
  id: string;
  status: "ok" | "err";
  title: string;
  time: string;
  linkLabel: string;
  linkHref: string;
}

export const MOCK_ACTIVITY: ActivityItem[] = [
  { id: "1", status: "ok", title: "Campaign Autumn Collection published successfully.", time: "2 jam lalu", linkLabel: "Buka detail", linkHref: "/overview" },
  { id: "2", status: "err", title: "Error: Creative missing headline text.", time: "2 jam lalu", linkLabel: "Buka detail", linkHref: "/detail" },
  { id: "3", status: "ok", title: "Campaign Summer Sale 2025 approved.", time: "2 jam lalu", linkLabel: "Buka detail", linkHref: "/overview" },
  { id: "4", status: "ok", title: "Insight baru dari TikTok Ads tersedia.", time: "4 jam lalu", linkLabel: "Buka detail", linkHref: "/insight" },
];
