import type { Metadata } from "next";
import { LegalPageLayout, LegalSection } from "@/features/landing/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Ketentuan Layanan — Lensa",
  description: "Ketentuan penggunaan layanan Lensa.",
};

export default function KetentuanLayananPage() {
  return (
    <LegalPageLayout title="Ketentuan Layanan" updatedLabel="Terakhir diperbarui: 5 Agustus 2026">
      <LegalSection heading="1. Pendahuluan">
        <p>
          Ketentuan Layanan ini mengatur penggunaan Anda atas Lensa, dashboard yang menampilkan performa iklan Meta
          Ads dan TikTok Ads dalam satu tampilan. Dengan membuat akun atau menggunakan Lensa, Anda menyetujui
          ketentuan di bawah ini.
        </p>
      </LegalSection>

      <LegalSection heading="2. Akun Pengguna">
        <p>
          Anda bertanggung jawab menjaga kerahasiaan kredensial akun Anda dan atas seluruh aktivitas yang terjadi di
          akun tersebut. Segera beri tahu kami jika Anda menduga ada akses tidak sah ke akun Anda.
        </p>
      </LegalSection>

      <LegalSection heading="3. Koneksi ke Platform Iklan">
        <p>
          Lensa terhubung ke akun Meta Ads dan/atau TikTok Ads Anda melalui otorisasi resmi masing-masing platform.
          Anda mengizinkan Lensa membaca data performa iklan dari akun yang Anda hubungkan, dan dapat memutus koneksi
          tersebut kapan saja melalui pengaturan akun.
        </p>
      </LegalSection>

      <LegalSection heading="4. Pembayaran &amp; Langganan">
        <p>
          Sebagian fitur Lensa memerlukan langganan berbayar. Rincian harga dan fitur setiap paket tersedia di
          halaman Harga. Langganan diperpanjang otomatis kecuali dibatalkan sebelum periode berikutnya dimulai.
        </p>
      </LegalSection>

      <LegalSection heading="5. Batasan Tanggung Jawab">
        <p>
          Lensa menampilkan data berdasarkan informasi yang disediakan oleh platform iklan pihak ketiga. Kami tidak
          bertanggung jawab atas keputusan bisnis yang diambil berdasarkan data atau insight yang ditampilkan di
          dashboard.
        </p>
      </LegalSection>

      <LegalSection heading="6. Perubahan Ketentuan">
        <p>
          Kami dapat memperbarui Ketentuan Layanan ini dari waktu ke waktu. Perubahan signifikan akan diinformasikan
          melalui email atau notifikasi di dalam aplikasi.
        </p>
      </LegalSection>

      <LegalSection heading="7. Kontak">
        <p>
          Ada pertanyaan soal Ketentuan Layanan ini? Hubungi kami melalui email di{" "}
          <a href="mailto:halo@lensa.app" className="font-semibold text-ink hover:underline">
            halo@lensa.app
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
