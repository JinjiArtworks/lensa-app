export interface PlatformConnection {
  key: "meta" | "tiktok";
  name: string;
  sub: string;
  ic: string;
  syncStatus: "ok" | "error";
  lastSync: string;
}

export const PLATFORM_CONNECTIONS: PlatformConnection[] = [
  { key: "meta", name: "Meta Ads", sub: "Facebook & Instagram Ads", ic: "M", syncStatus: "ok", lastSync: "12 menit lalu" },
  { key: "tiktok", name: "TikTok Ads", sub: "TikTok for Business", ic: "TT", syncStatus: "error", lastSync: "2 jam lalu" },
];
