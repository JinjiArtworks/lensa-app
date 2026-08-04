import { PlatformConnectionList } from "@/features/connect-platform/components/PlatformConnectionList";

export default function ConnectPlatformPage() {
  return (
    <div>
      <div className="mb-4">
        <h1 className="text-[23px] font-extrabold tracking-tight">Connect Platform</h1>
        <div className="mt-0.5 text-xs text-ink-3">
          Plan Pro — Meta Ads &amp; TikTok Ads terhubung otomatis sebagai platform inti
        </div>
      </div>
      <PlatformConnectionList />
    </div>
  );
}
