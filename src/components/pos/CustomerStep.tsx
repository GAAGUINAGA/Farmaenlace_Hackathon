import { IdCard, Loader2, Search, UserRound } from "lucide-react";
import type { FormEvent } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FAMILY_LABELS, type DemoData } from "@/api";
import type { PosDemoState } from "./usePosDemo";
import { Panel } from "./Panel";

/** Paso 1: ingreso de la cédula del cliente (cédulas FICTICIAS de demostración). */
export function CustomerStep({ pos, data }: { pos: PosDemoState; data: DemoData }) {
  const submit = (e: FormEvent) => {
    e.preventDefault();
    void pos.lookup(pos.cedulaDraft);
  };
  return (
    <div className="mx-auto w-full max-w-xl">
      <Panel title="Ingreso del cliente" icon={IdCard}>
        <form onSubmit={submit} className="grid gap-3" noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="cedula">Cédula del cliente</Label>
            <div className="flex gap-2">
              <Input
                id="cedula"
                inputMode="numeric"
                autoComplete="off"
                maxLength={12}
                placeholder="Ej.: 0900000001"
                value={pos.cedulaDraft}
                onChange={(e) => pos.setCedulaDraft(e.target.value)}
                aria-invalid={pos.lookupError !== null}
                aria-describedby="cedula-ayuda"
                className="h-11 text-base"
              />
              <Button
                type="submit"
                className="h-11 px-5"
                disabled={pos.busy || pos.cedulaDraft.trim().length === 0}
              >
                {pos.busy ? <Loader2 className="animate-spin" /> : <Search />}
                Buscar cliente
              </Button>
            </div>
            <p id="cedula-ayuda" className="text-xs text-muted-foreground">
              Solo funcionan las cédulas de demostración de abajo: son números inventados.
            </p>
          </div>
          {pos.lookupError && (
            <Alert variant="destructive">
              <AlertDescription>{pos.lookupError}</AlertDescription>
            </Alert>
          )}
        </form>

        <div className="mt-4 border-t pt-3">
          <p className="mb-2 text-xs font-extrabold uppercase text-muted-foreground">
            Cédulas de demostración (3 casos)
          </p>
          <ul className="grid gap-2">
            {data.customers.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  disabled={pos.busy}
                  onClick={() => pos.setCedulaDraft(c.cedula)}
                  className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border bg-card p-3 text-left transition-colors hover:bg-secondary disabled:opacity-60"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-foreground">
                      <UserRound size={15} />
                    </span>
                    <span>
                      <span className="block text-sm font-bold">{c.name}</span>
                      <span className="block text-xs tabular-nums text-muted-foreground">
                        {c.cedula}
                      </span>
                    </span>
                  </span>
                  <Badge variant="secondary" className="shrink-0">
                    Caso {FAMILY_LABELS[c.required_family]}
                  </Badge>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Panel>
    </div>
  );
}
