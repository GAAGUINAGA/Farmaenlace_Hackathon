import { createFileRoute } from "@tanstack/react-router";

import { POSDemo } from "@/components/pos/POSDemo";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Demo del POS · FarmaPOS" },
      {
        name: "description",
        content:
          "Mostrador simulado: priorización de una acción autorizada con datos ficticios y motor de reglas simulado.",
      },
    ],
  }),
  component: () => (
    <div className="min-h-dvh bg-showcase">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl">
        <POSDemo />
      </main>
    </div>
  ),
});
