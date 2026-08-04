export interface UserProfileDoc {
  name: string;
  email: string;
  createdAt: unknown; // Firestore serverTimestamp() sentinel on write, Timestamp on read
}

export interface BusinessDoc {
  id: string;
  ownerId: string;
  name: string;
  connectedPlatforms: string[];
  createdAt: unknown;
}
