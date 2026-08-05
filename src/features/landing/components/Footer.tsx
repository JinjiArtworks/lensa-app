import Link from "next/link";
import { BrandMark } from "./BrandMark";

const PRODUK_LINKS = [
  { href: "/#cara-kerja", label: "Cara Kerja" },
  { href: "/#fitur", label: "Fitur" },
  { href: "/#harga", label: "Harga" },
];

const PERUSAHAAN_LINKS = [
  { href: "/", label: "Tentang Lensa" },
  { href: "/", label: "Kontak" },
];

const LEGAL_LINKS = [
  { href: "/ketentuan-layanan", label: "Ketentuan Layanan" },
  { href: "/kebijakan-privasi", label: "Kebijakan Privasi" },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-white px-5 py-[60px]">
      <div className="mx-auto grid max-w-[1100px] grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2">
            <BrandMark size={26} />
            <span className="font-display font-semibold text-ink-2">Lensa</span>
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-2 md:max-w-[240px]">
            Satu dashboard untuk semua performa iklanmu — Meta Ads dan TikTok Ads, jernih dalam satu tampilan,
            lengkap dengan AI yang membantu menentukan langkah berikutnya.
          </p>
        </div>
        <div>
          <div className="mb-3.5 text-[11.5px] font-extrabold uppercase tracking-wide text-ink-3">Produk</div>
          {PRODUK_LINKS.map((l) => (
            <Link key={l.label} href={l.href} className="block py-1.5 text-[13.5px] text-ink-2 hover:text-ink">
              {l.label}
            </Link>
          ))}
        </div>
        <div>
          <div className="mb-3.5 text-[11.5px] font-extrabold uppercase tracking-wide text-ink-3">Perusahaan</div>
          {PERUSAHAAN_LINKS.map((l) => (
            <Link key={l.label} href={l.href} className="block py-1.5 text-[13.5px] text-ink-2 hover:text-ink">
              {l.label}
            </Link>
          ))}
        </div>
        <div>
          <div className="mb-3.5 text-[11.5px] font-extrabold uppercase tracking-wide text-ink-3">Legal</div>
          {LEGAL_LINKS.map((l) => (
            <Link key={l.label} href={l.href} className="block py-1.5 text-[13.5px] text-ink-2 hover:text-ink">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
