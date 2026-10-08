import { createFileRoute } from "@tanstack/react-router";

import { ResultsView } from "@/components/results/ResultsView";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/resultados")({
  head: () => ({
    meta: [
      { title: "Resultados para Comercial · FarmaPOS" },
      {
        name: "description",
        content:
          "Eventos, tasas con sus denominadores y propuesta de la siguiente prueba. Datos ficticios, observacionales.",
      },
    ],
  }),
  component: () => (
    <div className="min-h-dvh bg-showcase">
      <SiteHeader />
      <main>
        <ResultsView />
      </main>
    </div>
  ),
});
