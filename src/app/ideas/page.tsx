import Link from "next/link";
import { IDEA_SPARKS } from "@/lib/content";

export const metadata = {
  title: "Idea sparks — CashRaise",
  description: "Project ideas you can turn into non-custodial BCH campaigns.",
};

export default function IdeasPage() {
  return (
    <div className="space-y-10 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Idea sparks</h1>
        <p className="text-zinc-400 mt-2">
          Starting points for builders. Pick one, adapt it, pay the on-chain
          listing fee, and raise peer-to-peer — donations go straight to your
          address.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-1">
        {IDEA_SPARKS.map((idea) => {
          const q = new URLSearchParams();
          if (idea.seedTitle) q.set("title", idea.seedTitle);
          const href = `/create?${q.toString()}`;

          return (
            <li
              key={idea.id}
              className="border border-zinc-800 bg-zinc-900/40 rounded-xl p-5 space-y-3"
            >
              <h2 className="text-lg font-semibold">{idea.title}</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">{idea.blurb}</p>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {idea.tags.map((t) => (
                    <span
                      key={t}
                      className="text-xs bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <Link
                  href={href}
                  className="text-sm font-medium text-[var(--accent)] hover:text-[var(--accent)]"
                >
                  Use this idea →
                </Link>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="border border-zinc-800 rounded-xl p-5 text-sm text-zinc-400 text-center space-y-2">
        <p>Have your own idea?</p>
        <Link href="/create" className="inline-block btn btn-primary">
          List an idea
        </Link>
      </div>
    </div>
  );
}
