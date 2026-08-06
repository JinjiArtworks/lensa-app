import type { PlatformKey } from "@/features/overview-dashboard/mock-data";

// Simplified inline marks (not a trace of the official logos) — good enough to
// tell Meta and TikTok apart at a glance in a connection-status row without
// pulling in an external icon asset per CLAUDE.md's "no external assets" rule.
function MetaMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="9" cy="12" r="6.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="15" cy="12" r="6.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function TikTokMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M15 3v9.5a3.5 3.5 0 1 1-3.5-3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 3c0 2.2 1.8 4 4 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlatformIcon({ platformKey, className }: { platformKey: PlatformKey; className?: string }) {
  return platformKey === "meta" ? <MetaMark className={className} /> : <TikTokMark className={className} />;
}
