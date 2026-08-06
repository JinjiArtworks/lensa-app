export interface UserProfileDoc {
  name: string;
  email: string;
  createdAt: unknown; // Firestore serverTimestamp() sentinel on write, Timestamp on read
}

export type BusinessPlan = "free" | "pro";

export const BUSINESS_CATEGORIES = ["Fashion & Retail", "F&B", "Electronics", "Jasa", "Lainnya"] as const;
export type BusinessCategory = (typeof BUSINESS_CATEGORIES)[number];

export interface BusinessDoc {
  id: string;
  ownerId: string;
  name: string;
  category: BusinessCategory;
  connectedPlatforms: string[];
  plan: BusinessPlan;
  createdAt: unknown;
}
