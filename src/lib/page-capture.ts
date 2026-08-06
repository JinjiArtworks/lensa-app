const CAPTURE_TARGET_ID = "dashboard-main-content";

export async function captureMainContent(): Promise<HTMLCanvasElement | null> {
  const target = document.getElementById(CAPTURE_TARGET_ID);
  if (!target) return null;
  const { default: html2canvas } = await import("html2canvas");
  return html2canvas(target, {
    backgroundColor: "#ffffff",
    scale: 2,
    ignoreElements: (el) => el.closest("[data-report-hide]") !== null,
  });
}
