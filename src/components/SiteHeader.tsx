import { Link } from "@tanstack/react-router";
import { Pill } from "lucide-react";

/** Logotipo textual de FarmaPOS (sin marca real de Farmaenlace). */
export function Brand({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`flex items-center gap-2.5 font-black ${className}`}
      aria-label="FarmaPOS, inicio"
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-brand">
        <Pill size={18} strokeWidth={2.6} />
      </span>
      <span className="text-lg leading-none tracking-tight">FarmaPOS</span>
    </Link>
  );
}

/** Encabezado de las páginas /demo y /resultados. */
export function SiteHeader() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Brand />
        <nav className="flex items-center gap-1 text-sm font-semibold" aria-label="Principal">
          <Link
            to="/"
            className="rounded-lg px-3 py-2 hover:bg-accent"
            activeOptions={{ exact: true }}
          >
            Inicio
          </Link>
          <Link
            to="/demo"
            className="rounded-lg px-3 py-2 hover:bg-accent"
            activeProps={{ className: "bg-primary-soft text-primary" }}
          >
            Demo
          </Link>
          <Link
            to="/resultados"
            className="rounded-lg px-3 py-2 hover:bg-accent"
            activeProps={{ className: "bg-primary-soft text-primary" }}
          >
            Resultados
          </Link>
        </nav>
      </div>
    </header>
  );
}
