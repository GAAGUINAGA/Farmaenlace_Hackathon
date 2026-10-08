import { ScrollText } from "lucide-react";

import type { DemoData, DemoEvent } from "@/api";
import { Badge } from "@/components/ui/badge";
import { eventTime } from "@/lib/time";
import { Panel } from "./Panel";

const LABELS: Record<DemoEvent["type"], string> = {
  recommended: "Recomendada",
  presented: "Presentada",
  not_presented: "No presentada (omitida)",
  accepted: "Aceptada verbalmente",
  declined: "Rechazada",
  purchased: "Compra vinculada",
};

export function EventLog({ events, data }: { events: DemoEvent[]; data: DemoData }) {
  const rows = [...events].reverse();
  return (
    <Panel
      title="Registro de eventos"
      icon={ScrollText}
      action={<span className="text-xs text-muted-foreground">{events.length} eventos</span>}
    >
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aún no hay eventos.</p>
      ) : (
        <ol className="max-h-64 divide-y overflow-y-auto pr-1" aria-label="Eventos recientes">
          {rows.map((e) => (
            <li
              key={e.event_id}
              className="flex flex-wrap items-center gap-x-2 gap-y-0.5 py-2 text-sm"
            >
              <Badge variant={e.type === "purchased" ? "default" : "secondary"}>
                {LABELS[e.type]}
              </Badge>
              <span className="font-semibold">
                {data.customers.find((c) => c.id === e.customer_id)?.name ?? e.customer_id}
              </span>
              <span className="text-muted-foreground">
                · Promoción{" "}
                {data.promotions.find((p) => p.id === e.promotion_id)?.label ?? e.promotion_id}
              </span>
              <span className="w-full text-xs text-muted-foreground sm:ml-auto sm:w-auto">
                {eventTime(e.at)} · {e.recommendation_id} · reglas {e.rules_version} · campaña v
                {e.campaign_version}
                {e.transaction_id ? ` · ${e.transaction_id}` : ""}
              </span>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}
