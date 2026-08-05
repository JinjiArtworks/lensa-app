import { Bricolage_Grotesque } from "next/font/google";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-bricolage",
});

export function LegalPageLayout({
  title,
  updatedLabel,
  children,
}: {
  title: string;
  updatedLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`${bricolage.variable} landing-grid-bg`}>
      <Nav />

      <main className="mx-auto max-w-[720px] px-5 py-16 md:py-[92px]">
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-[32px]">{title}</h1>
        <p className="mt-2 text-[13px] text-ink-3">{updatedLabel}</p>

        <div className="mt-10 space-y-8">{children}</div>
      </main>

      <Footer />
    </div>
  );
}

export function LegalSection({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-[17px] font-bold tracking-tight">{heading}</h2>
      <div className="mt-2.5 space-y-3 text-[13.5px] leading-relaxed text-ink-2">{children}</div>
    </section>
  );
}
