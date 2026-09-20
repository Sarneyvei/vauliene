import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/novidades")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Novidades e atualizações — Galaxy Online IV" },
      {
        name: "description",
        content:
          "Acompanhe o histórico de versões, novos sistemas e ajustes de equilíbrio de Galaxy Online IV.",
      },
      { property: "og:title", content: "Novidades — Galaxy Online IV" },
      { property: "og:description", content: "Histórico de versões e novidades do jogo." },
    ],
  }),
  component: NewsPage,
});

type NewsRow = {
  id: string;
  version: string;
  title: string;
  body: string;
  category: string;
  published_at: string;
};

function NewsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["news"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("published_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as NewsRow[];
    },
  });

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <Link to="/" className="font-display text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
        ← Galaxy Online IV
      </Link>
      <h1 className="holo-title mt-4 text-3xl">Novidades</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Registro público de versões e mudanças aplicadas ao jogo.
      </p>

      <div className="mt-8 space-y-4">
        {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
        {!isLoading && !data?.length && (
          <p className="text-sm text-muted-foreground">Nenhuma atualização publicada ainda.</p>
        )}
        {data?.map((n) => (
          <article key={n.id} className="panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-sm uppercase tracking-[0.2em] text-primary">{n.title}</h2>
              <span className="rounded border border-border/70 px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                v{n.version} · {n.category}
              </span>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">{n.body}</p>
            <p className="mt-3 text-[10px] uppercase tracking-widest text-muted-foreground">
              {new Date(n.published_at).toLocaleDateString("pt-BR")}
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
