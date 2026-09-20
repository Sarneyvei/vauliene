import { ClientOnly } from "@tanstack/react-router";
import { Component, lazy, Suspense, type ComponentProps, type ReactNode } from "react";

const PlanetScene = lazy(() => import("./PlanetScene"));
const GalaxyScene = lazy(() => import("./GalaxyScene"));

function Fallback({ label }: { label: string }) {
  return (
    <div className="grid-floor flex h-full w-full items-center justify-center rounded-lg border border-border/60">
      <span className="animate-go4-pulse font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

class SceneBoundary extends Component<{ label: string; children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override componentDidCatch(error: unknown) {
    console.warn("[Scene3D] falha ao renderizar cena 3D:", error);
  }

  override render() {
    if (this.state.failed) {
      return (
        <div className="grid-floor flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg border border-border/60 p-4 text-center">
          <span className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {this.props.label}
          </span>
          <span className="text-[11px] text-muted-foreground">
            Visualização 3D indisponível neste dispositivo. O jogo continua funcionando normalmente.
          </span>
        </div>
      );
    }
    return this.props.children;
  }
}

function Scene({ label, children }: { label: string; children: ReactNode }) {
  return (
    <ClientOnly fallback={<Fallback label={label} />}>
      <SceneBoundary label={label}>
        <Suspense fallback={<Fallback label={label} />}>{children}</Suspense>
      </SceneBoundary>
    </ClientOnly>
  );
}

export function Planet3D(props: ComponentProps<typeof PlanetScene>) {
  return (
    <Scene label="Carregando planeta">
      <PlanetScene {...props} />
    </Scene>
  );
}

export function Galaxy3D(props: ComponentProps<typeof GalaxyScene>) {
  return (
    <Scene label="Sincronizando mapa">
      <GalaxyScene {...props} />
    </Scene>
  );
}
