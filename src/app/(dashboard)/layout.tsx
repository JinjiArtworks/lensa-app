import { Sidebar } from "@/features/app-shell/components/Sidebar";
import { TopBar } from "@/features/app-shell/components/TopBar";
import { AuthGuard } from "@/features/auth/components/AuthGuard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen items-start">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <TopBar />
          <main
            id="dashboard-main-content"
            className="mx-auto max-w-[1260px] px-7 py-6 pb-16 max-[640px]:px-4 max-[640px]:py-4"
          >
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
