const FIREBASE_AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/email-already-in-use": "Email ini sudah terdaftar. Coba masuk, atau pakai email lain.",
  "auth/invalid-email": "Format email tidak valid.",
  "auth/weak-password": "Password terlalu lemah, minimal 8 karakter.",
  "auth/user-not-found": "Email atau password salah.",
  "auth/wrong-password": "Email atau password salah.",
  "auth/invalid-credential": "Email atau password salah.",
  "auth/too-many-requests": "Terlalu banyak percobaan gagal. Coba lagi beberapa menit lagi.",
  "auth/network-request-failed": "Koneksi bermasalah. Cek internet kamu dan coba lagi.",
};

const DEFAULT_MESSAGE = "Terjadi kesalahan. Coba lagi sebentar lagi.";

function isFirebaseAuthError(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error && typeof (error as { code: unknown }).code === "string";
}

export function mapFirebaseAuthError(error: unknown): string {
  const code = isFirebaseAuthError(error) ? error.code : undefined;
  if (code && code in FIREBASE_AUTH_ERROR_MESSAGES) return FIREBASE_AUTH_ERROR_MESSAGES[code];
  return DEFAULT_MESSAGE;
}
