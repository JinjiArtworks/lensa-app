export interface Invoice {
  date: string;
  desc: string;
  amount: string;
  status: "Lunas" | "Gagal";
}

export const INVOICES: Invoice[] = [
  { date: "1 Agu 2026", desc: "Langganan Pro — Agustus 2026", amount: "Rp149.000", status: "Lunas" },
  { date: "1 Jul 2026", desc: "Langganan Pro — Juli 2026", amount: "Rp149.000", status: "Lunas" },
  { date: "3 Jun 2026", desc: "Langganan Pro — Juni 2026 (percobaan ulang)", amount: "Rp149.000", status: "Lunas" },
  { date: "1 Jun 2026", desc: "Langganan Pro — Juni 2026", amount: "Rp149.000", status: "Gagal" },
  { date: "1 Mei 2026", desc: "Langganan Pro — Mei 2026", amount: "Rp149.000", status: "Lunas" },
];
