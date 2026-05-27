import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { normalizeNextPath } from "@/lib/navigation";
import LoginPanel from "@/components/LoginPanel";

export const metadata = {
  title: "Masuk - AniStream",
};

export default async function LoginPage(props: {
  searchParams: Promise<{ next?: string; mode?: string }>;
}) {
  const searchParams = await props.searchParams;
  const nextPath = normalizeNextPath(searchParams.next, "/");
  const mode = searchParams.mode === "register" ? "register" : "login";
  const user = await getCurrentUser();

  if (user) {
    redirect(nextPath);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1fr_440px]">
        <section className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#a29bfe]">
            AniStream Account
          </div>
          <div className="space-y-5">
            <h1 className="max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
              Masuk untuk lanjut nonton dari titik terakhir.
            </h1>
            <p className="max-w-2xl text-sm font-medium leading-7 text-gray-400 sm:text-base">
              Akun menyimpan riwayat anime dan episode yang kamu tonton di Samehadaku maupun Otakudesu.
            </p>
          </div>

          <div className="grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              ["History anime", "Lanjutkan judul terakhir"],
              ["History episode", "Urut dari terbaru"],
              ["Multi source", "Samehadaku dan Otakudesu"],
            ].map(([title, text]) => (
              <div key={title} className="glass rounded-2xl p-5">
                <p className="text-sm font-black text-white">{title}</p>
                <p className="mt-2 text-xs font-bold leading-5 text-gray-500">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <LoginPanel initialMode={mode} nextPath={nextPath} />
      </div>
    </div>
  );
}
