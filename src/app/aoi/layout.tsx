import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "aoi | Web Studio Wanderlust",
  description: "aoi page — Web Studio Wanderlust",
};

export default function AoiLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f4f6fb] text-[#1a2233] font-sans">
      <header className="border-b border-[#d6deea] bg-white/70 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/aoi" className="text-xl font-bold tracking-tight">
            aoi
          </Link>
          <Link
            href="/"
            className="text-sm text-[#41506b] hover:text-[#1a2233] transition-colors"
          >
            ← Wanderlust トップへ
          </Link>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[#d6deea] py-6">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-sm text-[#6b7894]">
          © {new Date().getFullYear()} Web Studio Wanderlust
        </div>
      </footer>
    </div>
  );
}
