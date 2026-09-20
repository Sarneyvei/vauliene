import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export type NewsRow = {
  id: string;
  version: string;
  title: string;
  body: string;
  category: string;
  published_at: string;
};

export const CATEGORY_LABEL: Record<string, string> = {
  update: "Atualização",
  commander: "Comandantes",
  planet: "Planetas",
  event: "Evento",
  fix: "Correção",
  maintenance: "Manutenção",
};

export function useNews() {
  return useQuery({
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
}

/** Notícias e atualizações dentro do painel do jogo. */
export default function NewsPanel() {
  const { data, isLoading, error } = useNews();

  return (
    <div className="space-y-4">
      {isLoading && <p className="panel p-5 text-sm text-muted-foreground">Carregando notícias...</p>}
      {error && (
        <p className="panel p-5 text-sm text-destructive">
          Não foi possível carregar as notícias agora.
        </p>
      )}
      {!isLoading && !error && !data?.length && (
        <p className="panel p-5 text-sm text-muted-foreground">Nenhuma notícia publicada ainda.</p>
      )}
      {data?.map((n) => (
        <article key={n.id} className="panel p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-sm uppercase tracking-[0.2em] text-primary">{n.title}</h3>
            <span className="rounded border border-border/70 px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
              v{n.version} · {CATEGORY_LABEL[n.category] ?? n.category}
            </span>
          </div>
          <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">{n.body}</p>
          <p className="mt-3 text-[10px] uppercase tracking-widest text-muted-foreground">
            {new Date(n.published_at).toLocaleDateString("pt-BR")}
          </p>
        </article>
      ))}
    </div>
  );
}
