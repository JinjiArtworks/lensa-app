import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// next/font/google relies on a Next.js-specific SWC/webpack transform that
// doesn't exist under Vitest's plain Vite pipeline — without this, calling
// e.g. Bricolage_Grotesque({...}) throws "is not a function" in any test
// that imports a component using it.
vi.mock("next/font/google", () => ({
  Inter: () => ({ className: "", variable: "" }),
  Bricolage_Grotesque: () => ({ className: "", variable: "" }),
}));

class IntersectionObserverStub implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

(globalThis as unknown as { IntersectionObserver: typeof IntersectionObserver }).IntersectionObserver =
  IntersectionObserverStub as unknown as typeof IntersectionObserver;
