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
          <div className="inline-flex rotate-[-2deg] items-center gap-2 rounded-lg border-[3px] border-[#1E1B29] bg-[#00CEC9] px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#1E1B29] shadow-[4px_4px_0_#1E1B29]">
            AniStream Account ✨
          </div>
          <div className="space-y-5">
            <h1 className="font-display max-w-3xl text-4xl font-black leading-tight text-[#6C5CE7] [-webkit-text-stroke:1.5px_#1E1B29] [text-shadow:4px_4px_0_#1E1B29] sm:text-5xl lg:text-6xl">
              Masuk untuk lanjut nonton dari titik terakhir.
            </h1>
            <p className="max-w-2xl rounded-xl border-[3px] border-[#1E1B29] bg-white p-4 text-sm font-extrabold leading-7 text-[#1E1B29] shadow-[5px_5px_0_#1E1B29] sm:text-base">
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
                <p className="font-display text-sm font-black text-[#1E1B29]">{title}</p>
                <p className="mt-2 text-xs font-extrabold leading-5 text-[#1E1B29]/75">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <LoginPanel initialMode={mode} nextPath={nextPath} />
      </div>
    </div>
  );
}
