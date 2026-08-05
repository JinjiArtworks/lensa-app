import type { Metadata } from "next";
import { LegalPageLayout, LegalSection } from "@/features/landing/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Kebijakan Privasi — Lensa",
  description: "Kebijakan privasi dan penanganan data pengguna Lensa.",
};

export default function KebijakanPrivasiPage() {
  return (
    <LegalPageLayout title="Kebijakan Privasi" updatedLabel="Terakhir diperbarui: 5 Agustus 2026">
      <LegalSection heading="1. Data yang Kami Kumpulkan">
        <p>
          Kami mengumpulkan data akun (nama, email, nama bisnis) yang Anda berikan saat mendaftar, serta data
          performa iklan (impresi, klik, konversi, biaya, dan metrik lain) dari akun Meta Ads dan/atau TikTok Ads
          yang Anda hubungkan ke Lensa.
        </p>
      </LegalSection>

      <LegalSection heading="2. Bagaimana Kami Menggunakan Data">
        <p>
          Data digunakan untuk menampilkan dashboard performa iklan, menghasilkan AI Insight, dan mengirim
          notifikasi terkait akun Anda. Kami tidak menjual data Anda kepada pihak ketiga.
        </p>
      </LegalSection>

      <LegalSection heading="3. Berbagi Data dengan Pihak Ketiga">
        <p>
          Untuk menampilkan data iklan, Lensa berkomunikasi dengan API resmi Meta Ads dan TikTok Ads menggunakan
          izin yang Anda berikan saat menghubungkan akun. Kami juga menggunakan penyedia layanan pihak ketiga
          (seperti hosting dan pemrosesan pembayaran) yang terikat kewajiban menjaga kerahasiaan data.
        </p>
      </LegalSection>

      <LegalSection heading="4. Keamanan Data">
        <p>
          Kami menerapkan langkah keamanan teknis dan organisasi yang wajar untuk melindungi data Anda dari akses,
          perubahan, atau pengungkapan yang tidak sah.
        </p>
      </LegalSection>

      <LegalSection heading="5. Hak Anda">
        <p>
          Anda dapat mengakses, memperbarui, memutus koneksi platform iklan, atau meminta penghapusan data akun Anda
          kapan saja melalui pengaturan akun atau dengan menghubungi kami.
        </p>
      </LegalSection>

      <LegalSection heading="6. Perubahan Kebijakan">
        <p>
          Kebijakan Privasi ini dapat diperbarui dari waktu ke waktu. Perubahan signifikan akan diinformasikan
          melalui email atau notifikasi di dalam aplikasi.
        </p>
      </LegalSection>

      <LegalSection heading="7. Kontak">
        <p>
          Ada pertanyaan soal privasi data Anda? Hubungi kami melalui email di{" "}
          <a href="mailto:halo@lensa.app" className="font-semibold text-ink hover:underline">
            halo@lensa.app
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
