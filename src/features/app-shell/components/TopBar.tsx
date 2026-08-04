import { NotificationDropdown } from "./NotificationDropdown";

export function TopBar() {
  return (
    <div className="sticky top-0 z-40 border-b border-line bg-card">
      <div className="flex items-center justify-end gap-2.5 px-7 py-3">
        <NotificationDropdown />
      </div>
    </div>
  );
}
