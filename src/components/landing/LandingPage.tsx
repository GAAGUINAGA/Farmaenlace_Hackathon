import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Check,
  ClipboardList,
  Cpu,
  Filter,
  ListChecks,
  Megaphone,
  Menu,
  Pill,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Store,
  Tag,
  Target,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent } from "react";

import { POSDemo } from "@/components/pos/POSDemo";
import "./landing.css";

const INFO: { icon: LucideIcon; name: string; text: string }[] = [
  { icon: Tag, name: "Promociones", text: "Descuentos y beneficios aplicables" },
  { icon: Megaphone, name: "Campañas", text: "Objetivos y audiencias de Marketing" },
  { icon: Target, name: "Estrategias", text: "Prioridades por familia de productos" },
  { icon: ScrollText, name: "Lineamientos", text: "Mensajes y reglas de comunicación" },
  { icon: ListChecks, name: "Procedimientos", text: "Condiciones de operación en el local" },
];

const RULES: { title: string; text: string }[] = [
  { title: "Solo lo autorizado", text: "Campaña y promoción aprobadas y vigentes" },
  {
    title: "Condiciones primero",
    text: "Stock, membresía y piso de contribución: ningún score las supera",
  },
  {
    title: "Prioridad explicable",
    text: "Objetivo, afinidad conocida y canasta, con reglas configurables",
  },
  { title: "Una explicación", text: "Razones visibles y mensaje aprobado por la campaña" },
];

const STEPS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: ClipboardList,
    title: "Recibe",
    text: "Toma las recomendaciones existentes y las promociones disponibles. No las reemplaza.",
  },
  {
    icon: Filter,
    title: "Filtra",
    text: "Descarta lo que no se puede aplicar —sin aprobación, vencido, sin stock, sin membresía o bajo el piso— y muestra el motivo.",
  },
  {
    icon: Sparkles,
    title: "Prioriza y explica",
    text: "Ordena lo válido según el objetivo de la campaña, la afinidad conocida y la canasta, y dice por qué.",
  },
  {
    icon: BarChart3,
    title: "Registra y propone",
    text: "Guarda presentación, respuesta y compra por separado. Comercial recibe la propuesta de la siguiente prueba.",
  },
];

const TRI: { cls: string; tag: string; title: string; items: string[] }[] = [
  {
    cls: "tri-real",
    tag: "Real",
    title: "Implementado en este prototipo",
    items: [
      "Interfaz del POS y de la vista de resultados",
      "Reglas de elegibilidad, score y desempate",
      "Trazabilidad de eventos y transacciones simuladas",
      "Pruebas automáticas del motor y de la API",
      "Persistencia local en el navegador",
    ],
  },
  {
    cls: "tri-sim",
    tag: "Simulado",
    title: "Datos y conexiones de ejemplo",
    items: [
      "Clientes, afinidades y membresías ficticios",
      "Recomendaciones existentes y catálogo",
      "Campaña, promociones, costos y stock",
      "La API: un módulo en el navegador, no un servidor",
      "La conexión con PromoGo, Vendix y La Voz Comercial",
    ],
  },
  {
    cls: "tri-fut",
    tag: "Futuro",
    title: "Requiere validación con los equipos",
    items: [
      "Estimación predictiva de respuesta, validada con datos reales",
      "Integración con el golden record y las salidas de BI",
      "Evaluación de impacto con comparación controlada",
      "Persistencia compartida en servidor",
    ],
  },
];

const PILOT: { icon: LucideIcon; name: string; text: string }[] = [
  {
    icon: Store,
    name: "Comercial",
    text: "Aprueba campañas y prioridades, y decide qué acciones se comparan.",
  },
  {
    icon: Megaphone,
    name: "Marketing",
    text: "Define audiencias y mensajes autorizados por campaña.",
  },
  {
    icon: BarChart3,
    name: "BI",
    text: "Confirma fuentes de afinidad, eventos existentes y la métrica de la prueba.",
  },
  {
    icon: Cpu,
    name: "TI",
    text: "Valida la integración con POS, promociones, inventario y permisos.",
  },
];

const NAV: [string, string][] = [
  ["#filtro", "El filtro"],
  ["#como-funciona", "Cómo funciona"],
  ["#demo", "Demo"],
  ["#alcance", "Alcance"],
  ["#piloto", "Piloto"],
];

/** Landing de FarmaPOS. Los estilos viven en landing.css bajo `.landing`. */
export function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [jsReady, setJsReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Aparecer suave al hacer scroll
  useEffect(() => {
    setJsReady(true);
    const els = rootRef.current?.querySelectorAll(".reveal") ?? [];
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const closeMenuOnLink = (ev: MouseEvent<HTMLUListElement>) => {
    if ((ev.target as HTMLElement).closest("a")) setMenuOpen(false);
  };

  return (
    <div ref={rootRef} className={jsReady ? "landing" : "landing no-js"}>
      <div className="nav-wrap">
        <nav className="nav" aria-label="Principal">
          <Link
            to="/"
            className="flex items-center gap-2.5 font-extrabold"
            aria-label="FarmaPOS, inicio"
          >
            <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-[var(--blue)] text-white">
              <Pill size={17} strokeWidth={2.6} />
            </span>
            <span className="text-[19px] tracking-tight">FarmaPOS</span>
          </Link>
          <ul
            className={menuOpen ? "nav-links open" : "nav-links"}
            id="navLinks"
            onClick={closeMenuOnLink}
          >
            {NAV.map(([href, label]) => (
              <li key={href}>
                <a href={href}>{label}</a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <Link to="/demo" className="btn btn-primary btn-desktop">
              Abrir demo
            </Link>
            <button
              type="button"
              className="nav-toggle"
              aria-label="Abrir menú"
              aria-expanded={menuOpen}
              aria-controls="navLinks"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </nav>
      </div>

      <main>
        {/* 1. Hero con el problema */}
        <section className="hero" id="inicio">
          <div className="container">
            <div className="hero-inner">
              <span className="badge">
                <i>
                  <Sparkles />
                </i>
                Inteligencia en la primera línea
              </span>
              <h1>
                Al mostrador le llega demasiado. Necesita{" "}
                <span className="pill">una sola acción</span>
              </h1>
              <p className="lead">
                Promociones, campañas, estrategias, lineamientos y procedimientos llegan juntos al
                dependiente, que debe convertirlos en algo simple frente al cliente. FarmaPOS es un
                filtro entre esa información y la caja: prioriza <b>una</b> acción autorizada, la
                explica y registra lo que ocurre para que Comercial decida la siguiente prueba.
              </p>
              <div className="hero-ctas">
                <a href="#demo" className="btn btn-primary">
                  Probar la demo <ArrowRight />
                </a>
                <Link to="/resultados" className="btn btn-secondary">
                  Ver resultados para Comercial
                </Link>
              </div>
              <ul className="chips" aria-label="Información que hoy llega a la caja">
                {INFO.map(({ icon: Icon, name }) => (
                  <li key={name} className="chip" style={{ listStyle: "none" }}>
                    <Icon aria-hidden="true" />
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 2. Hoy llega → Filtrado inteligente → Acción simple y directa */}
        <section className="section" id="filtro">
          <div className="container">
            <div className="section-head reveal">
              <h2 className="h2">
                De la avalancha a <span className="hl">una acción</span>
              </h2>
              <p className="lead">
                No se agrega otro tablero: se coloca un filtro entre lo que ya existe y el punto de
                venta.
              </p>
            </div>
            <div className="flow reveal d1">
              <div className="flow-col">
                <h3>Hoy llega</h3>
                <p className="sub">Cinco tipos de información, al mismo tiempo</p>
                {INFO.map(({ icon: Icon, name, text }) => (
                  <div key={name} className="info-item">
                    <span className="ic">
                      <Icon aria-hidden="true" />
                    </span>
                    <span>
                      {name}
                      <small>{text}</small>
                    </span>
                  </div>
                ))}
              </div>
              <div className="arrow" aria-hidden="true">
                <ArrowRight />
              </div>
              <div className="flow-col filter">
                <h3>Filtrado inteligente</h3>
                <p className="sub">Reglas visibles, no una caja negra</p>
                {RULES.map((r) => (
                  <div key={r.title} className="rule">
                    <ShieldCheck aria-hidden="true" />
                    <div>
                      <b>{r.title}</b>
                      <span>{r.text}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="arrow" aria-hidden="true">
                <ArrowRight />
              </div>
              <div className="flow-col result">
                <h3>Acción simple y directa</h3>
                <p className="sub">Lo que ve el dependiente</p>
                <div className="out-card">
                  {[
                    "Una promoción autorizada",
                    "Una razón clara",
                    "Un mensaje aprobado",
                    "Un registro de lo ocurrido",
                  ].map((t) => (
                    <div key={t} className="out-line">
                      <Check aria-hidden="true" />
                      <b>{t}</b>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Cómo funciona */}
        <section className="section" id="como-funciona" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-head reveal">
              <h2 className="h2">Cómo funciona, en cuatro pasos</h2>
              <p className="lead">
                El score es de <b>reglas configuradas</b>: prioriza criterios, no predice compras ni
                incremento de ventas.
              </p>
            </div>
            <div className="grid-4">
              {STEPS.map(({ icon: Icon, title, text }, i) => (
                <article key={title} className={`card reveal d${(i % 3) + 1}`}>
                  <span className="step-tag">Paso {i + 1}</span>
                  <div className="ic lime">
                    <Icon aria-hidden="true" />
                  </div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Demo embebida */}
        <section className="section proto" id="demo">
          <div className="container">
            <div className="section-head reveal">
              <h2 className="h2">
                Pruébelo con <span className="hl">Rosa, Luis y Ana</span>
              </h2>
              <p className="lead">
                Todo ocurre en su navegador y con datos ficticios. Siga el «Recorrido de demo» al
                final del panel o cambie la configuración de Comercial para ver cómo cambia la
                acción.
              </p>
            </div>
            <div
              className="demo-frame"
              role="region"
              aria-label="Demo interactiva del POS"
              tabIndex={0}
            >
              <POSDemo embedded />
            </div>
            <div className="demo-note">
              <span>Los cambios se guardan en este navegador. «Reiniciar demo» restaura todo.</span>
              <Link to="/demo" className="btn btn-secondary">
                Abrir en pantalla completa <ArrowRight />
              </Link>
            </div>
          </div>
        </section>

        {/* 5. Real, simulado y futuro */}
        <section className="section" id="alcance">
          <div className="container">
            <div className="section-head reveal">
              <h2 className="h2">Qué es real, qué es simulado y qué es futuro</h2>
              <p className="lead">
                Este prototipo demuestra el mecanismo de decisión y la captura de evidencia. No
                prueba aumento de participación de mercado, rentabilidad ni mejora predictiva sobre
                clientes reales.
              </p>
            </div>
            <div className="grid-3">
              {TRI.map((t, i) => (
                <article key={t.tag} className={`card tri ${t.cls} reveal d${i + 1}`}>
                  <span className="tri-tag">{t.tag}</span>
                  <h3>{t.title}</h3>
                  <ul>
                    {t.items.map((item) => (
                      <li key={item}>
                        <Check aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Llamado a un piloto */}
        <section className="section cta" id="piloto">
          <div className="container">
            <div className="section-head reveal">
              <h2 className="h2">
                Un piloto con <span className="hl">cuatro equipos</span>
              </h2>
              <p className="lead">
                Proponemos una prueba acotada, con asignación acordada, periodo y métrica definidos
                junto con BI. Lo que se decide no es qué promoción gana hoy, sino qué comparar
                después.
              </p>
            </div>
            <div className="grid-4">
              {PILOT.map(({ icon: Icon, name, text }, i) => (
                <article key={name} className={`pilot-card reveal d${(i % 3) + 1}`}>
                  <span className="ic">
                    <Icon aria-hidden="true" />
                  </span>
                  <h3>{name}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
            <div className="cta-actions">
              <Link to="/demo" className="btn btn-primary">
                Ver la demo completa <ArrowRight />
              </Link>
              <Link to="/resultados" className="btn btn-secondary">
                Ver la vista de resultados
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="container">
          <div className="foot-top">
            <div>
              <div className="flex items-center gap-2.5 text-xl font-extrabold">
                <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-[var(--lime)] text-[var(--navy)]">
                  <Pill size={17} strokeWidth={2.6} />
                </span>
                FarmaPOS
              </div>
              <p className="foot-tag">Inteligencia en la primera línea</p>
            </div>
            <nav className="foot-links" aria-label="Secundario">
              <ul>
                <li>
                  <Link to="/demo">Demo a pantalla completa</Link>
                </li>
                <li>
                  <Link to="/resultados">Resultados para Comercial</Link>
                </li>
              </ul>
              <ul>
                <li>
                  <a href="#filtro">El filtro</a>
                </li>
                <li>
                  <a href="#alcance">Real, simulado y futuro</a>
                </li>
              </ul>
            </nav>
          </div>
          <div className="foot-bot">
            <span>
              <Users size={14} style={{ display: "inline", marginRight: 6 }} aria-hidden="true" />
              Prototipo con datos ficticios y motor de reglas simulado. No es un producto de
              Farmaenlace ni usa sus políticas reales.
            </span>
            <span>
              El score prioriza criterios configurados; no predice probabilidades ni incremento de
              ventas. No recomienda tratamientos ni infiere enfermedades.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
