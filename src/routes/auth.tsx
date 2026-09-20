import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Galaxy Online IV" },
      {
        name: "description",
        content:
          "Acesse seu centro de comando em Galaxy Online IV e continue a expansão da sua colônia espacial.",
      },
      { property: "og:title", content: "Entrar — Galaxy Online IV" },
      {
        property: "og:description",
        content: "Acesse seu centro de comando e continue a expansão da sua colônia espacial.",
      },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "recover";

function traduzErro(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("known to be weak") || m.includes("pwned"))
    return "Essa senha é muito comum e foi vazada em outros sites. Escolha uma senha diferente, com letras, números e símbolos.";
  if (m.includes("password should be at least"))
    return "A senha precisa ter pelo menos 6 caracteres.";
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (m.includes("user already registered") || m.includes("already been registered"))
    return "Já existe uma conta com esse e-mail. Use a opção Entrar.";
  if (m.includes("email not confirmed"))
    return "Confirme seu e-mail pelo link que enviamos antes de entrar.";
  if (m.includes("invalid email") || m.includes("email address"))
    return "Informe um endereço de e-mail válido.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.";
  return message;
}

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [aviso, setAviso] = useState<{ tipo: "erro" | "ok"; texto: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/jogo" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setAviso(null);
    try {
      if (mode === "recover") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/redefinir-senha`,
        });
        if (error) throw error;
        setAviso({
          tipo: "ok",
          texto: "Enviamos um link de recuperação para o seu e-mail.",
        });
        return;
      }

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/jogo` },
        });
        if (error) throw error;
        if (data.session) {
          toast.success("Conta criada! Entrando...");
          navigate({ to: "/jogo" });
          return;
        }
        setAviso({
          tipo: "ok",
          texto: `Conta criada. Enviamos um e-mail de confirmação para ${email} — clique no link para acessar o comando.`,
        });
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate({ to: "/jogo" });
    } catch (error) {
      const texto = traduzErro(error instanceof Error ? error.message : "Falha inesperada");
      setAviso({ tipo: "erro", texto });
      toast.error(texto);
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setAviso(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result?.error) {
      const texto = traduzErro(result.error.message);
      setAviso({ tipo: "erro", texto });
      toast.error(texto);
    } else {
      navigate({ to: "/jogo" });
    }
  }

  const titulo =
    mode === "signin" ? "Acesso ao Comando" : mode === "signup" ? "Novo Comandante" : "Recuperar Senha";

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="panel-glow w-full max-w-md p-7">
        <Link to="/" className="font-display text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
          ← Galaxy Online IV
        </Link>
        <h1 className="holo-title mt-4 text-2xl">{titulo}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "signin"
            ? "Identifique-se para retomar sua colônia."
            : mode === "signup"
              ? "Registre suas credenciais para receber um sistema estelar."
              : "Informe seu e-mail para receber o link de redefinição."}
        </p>

        {aviso ? (
          <div
            role="status"
            className={`mt-4 rounded-md border px-3 py-2 text-sm ${
              aviso.tipo === "erro"
                ? "border-destructive/50 bg-destructive/10 text-destructive-foreground"
                : "border-primary/40 bg-primary/10 text-foreground"
            }`}
          >
            {aviso.texto}
          </div>
        ) : null}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="comandante@frota.gal"
            />
          </div>
          {mode !== "recover" ? (
            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="mínimo de 8 caracteres"
              />
              {mode === "signup" ? (
                <p className="text-[11px] text-muted-foreground">
                  Use pelo menos 8 caracteres e evite senhas comuns (como "senha123") — elas são
                  recusadas por segurança.
                </p>
              ) : null}
            </div>
          ) : null}
          <Button type="submit" className="w-full font-display tracking-widest" disabled={busy}>
            {busy
              ? "Processando..."
              : mode === "signin"
                ? "Entrar"
                : mode === "signup"
                  ? "Criar conta"
                  : "Enviar link"}
          </Button>
        </form>

        {mode !== "recover" ? (
          <>
            <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              ou
              <span className="h-px flex-1 bg-border" />
            </div>

            <Button variant="outline" className="w-full" onClick={google}>
              Continuar com Google
            </Button>
          </>
        ) : null}

        <div className="mt-6 space-y-2 text-center">
          <button
            className="w-full text-xs text-muted-foreground underline-offset-4 hover:underline"
            onClick={() => {
              setAviso(null);
              setMode(mode === "signup" ? "signin" : "signup");
            }}
          >
            {mode === "signup" ? "Já tenho conta — entrar" : "Não tenho conta — criar agora"}
          </button>
          <button
            className="w-full text-xs text-muted-foreground underline-offset-4 hover:underline"
            onClick={() => {
              setAviso(null);
              setMode(mode === "recover" ? "signin" : "recover");
            }}
          >
            {mode === "recover" ? "Voltar ao login" : "Esqueci minha senha"}
          </button>
        </div>
      </div>
    </main>
  );
}
