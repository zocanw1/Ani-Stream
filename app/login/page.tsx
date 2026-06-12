import { Clock3, History, Layers3 } from "lucide-react";
import { redirect } from "next/navigation";

import LoginPanel from "@/components/LoginPanel";
import { getCurrentUser } from "@/lib/auth";
import { normalizeNextPath } from "@/lib/navigation";

export const metadata = { title: "Masuk - AniStream" };

const benefits = [
  { icon: History, title: "Lanjutkan anime", text: "Kembali ke judul terakhir yang ditonton." },
  { icon: Clock3, title: "Timeline episode", text: "Riwayat episode tersusun dari yang terbaru." },
  { icon: Layers3, title: "Dua sumber", text: "Samehadaku dan Otakudesu dalam satu akun." },
];

export default async function LoginPage(props: { searchParams: Promise<{ next?: string; mode?: string }> }) {
  const searchParams = await props.searchParams;
  const nextPath = normalizeNextPath(searchParams.next, "/");
  const mode = searchParams.mode === "register" ? "register" : "login";
  const user = await getCurrentUser();
  if (user) redirect(nextPath);

  return (
    <div className="min-h-[calc(100vh-60px)] bg-[#050607] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_430px]">
        <section>
          <p className="text-[10px] font-black uppercase text-[#ef1b24]">AniStream Account</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">Satu akun untuk melanjutkan semua tontonan.</h1>
          <p className="mt-5 max-w-2xl text-sm font-bold leading-7 text-neutral-400 sm:text-base">Masuk untuk menyimpan riwayat anime dan episode dari dua sumber AniStream.</p>
          <div className="mt-9 grid max-w-3xl gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-3">
            {benefits.map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-[#111416] p-5">
                <Icon size={19} className="text-[#ef1b24]" />
                <h2 className="mt-4 text-sm font-black">{title}</h2>
                <p className="mt-2 text-xs font-bold leading-5 text-neutral-500">{text}</p>
              </div>
            ))}
          </div>
        </section>
        <LoginPanel initialMode={mode} nextPath={nextPath} />
      </div>
    </div>
  );
}
