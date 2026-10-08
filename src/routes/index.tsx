import { createFileRoute } from "@tanstack/react-router";

import { LandingPage } from "@/components/landing/LandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FarmaPOS · Inteligencia en la primera línea" },
      {
        name: "description",
        content:
          "Prototipo con datos ficticios: un filtro entre la información comercial y la caja que prioriza una sola acción autorizada, la explica y registra lo que ocurre.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  component: LandingPage,
});
