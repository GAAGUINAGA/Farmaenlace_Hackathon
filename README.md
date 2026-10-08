# FarmaPOS — prototipo de inteligencia en la primera línea

Prototipo con **datos ficticios** y **motor de reglas simulado**. Un filtro entre la información comercial (promociones, campañas, estrategias, lineamientos, procedimientos) y la caja: prioriza **una** acción autorizada, la explica y registra lo que ocurre para que Comercial decida la siguiente prueba.

Fuente de verdad: [`docs/especificacion.md`](docs/especificacion.md). Reglas del proyecto: [`CLAUDE.md`](CLAUDE.md).

## Ejecutar

```sh
npm install
npm run dev          # http://localhost:5173
npm run test         # Vitest: motor, API y resultados
npm run typecheck
npm run lint
npm run build        # build de TanStack Start (Nitro)
npm run build:static # sitio estático (SPA) en dist/, para Render
```

Rutas: `/` landing con `<POSDemo />` embebido · `/demo` el mismo POS a pantalla completa · `/resultados` vista para Comercial.

## Flujo del POS (demo)

1. **Recorrido de demo** (contenedor horizontal al inicio): 5 pasos (Rosa, Luis, Ana, agotar stock de B, resultados).
2. **Cédula**: se ingresa una cédula **ficticia** de demostración (`0900000001` Rosa · `0900000002` Luis · `0900000003` Ana). Cualquier otra se rechaza.
3. **Factura**: tabla de 10 productos de referencia (4 Wellness, 4 Prácticos, 2 Membresía; patrón de inventario con búsqueda del POS de referencia). La demo **exige al menos un producto de la familia asignada** al caso (Rosa → Wellness, Luis → Prácticos, Ana → Membresía) para habilitar «Finalizar venta».
4. **Ventana emergente**: «Puedes darle a {cliente} la promoción {X}. Se aplican descuentos en: …», con el mensaje autorizado y las razones. Luego presentar/omitir → aceptar/rechazar → confirmar compra.
5. **Resultados**: si la campaña funciona se muestra un mensaje verde; si falla, una advertencia indicando que se debería promover otra estrategia.

## Arquitectura (sin backend)

```
src/engine   funciones puras: filtros duros, score, desempate, explicación, resultados
src/api      contrato de la sección 7 (recommend, registerEvent, confirmTransaction,
             getResults, getDemoData) con retardo simulado de 200–400 ms y localStorage
src/data     datos ficticios (clientes, productos, promociones, campaña)
src/components/pos | landing | results   UI (solo llama a `@/api`)
```

- El score es `configured_rules`: prioriza criterios; **no predice** compra ni incremento de ventas.
- Dinero en centavos enteros; aritmética entera para el score (sin errores de punto flotante).
- Aceptar verbalmente no es comprar; omitir no es rechazar; eventos y transacciones con el mismo ID no se duplican; una canasta modificada genera una nueva decisión; la compra revalida las condiciones.

## Qué es real, simulado y futuro

- **Real:** interfaz, reglas, trazabilidad, pruebas automáticas, persistencia local en el navegador.
- **Simulado:** clientes, afinidades, recomendaciones existentes, catálogo, campaña, costos, stock; la «API» es un módulo en el navegador (no un servidor); la conexión corporativa.
- **Futuro:** estimación predictiva validada, integración con golden record/BI, evaluación de impacto con comparación controlada, persistencia compartida en servidor.

## Supuestos (aprobados)

- Persistencia en `localStorage` (clave `farmapos:v2`), no en un JSON de servidor: los resultados no se sincronizan entre navegadores. Sin `localStorage` se usa memoria y la UI lo avisa.
- Piso de contribución US$1 por unidad; prioridad de la promoción C = 0,6 y C sin segmento asociado (marcados «supuesto» en la UI).
- Pesos del ranking fijos por objetivo (0,50/0,30/0,20 y 0,30/0,40/0,30), supuestos pendientes de aprobación de Comercial.
- Audiencia de una oportunidad = segmento de mayor afinidad conocida del cliente; Ana → «Afinidad desconocida».
- La promoción se aplica solo si la recomendación fue presentada, no fue rechazada y revalida; el descuento se aplica a 1 unidad de cada producto cubierto presente en la factura.
- Recomendaciones reemplazadas por un cambio de canasta/cliente/configuración antes de presentarse no cuentan como oportunidad.
- Evidencia: menos de 30 presentaciones por opción = «evidencia insuficiente»; nunca se elige una ganadora.
- Rosa y Luis no tienen jabón en sus recomendaciones, por lo que C solo es candidata para Ana. La exclusión de C por membresía para Rosa/Luis se prueba a nivel de motor con una variante de fixture.
- Funciones fuera del contrato de la sección 7 (necesarias para el panel de Comercial y «Reiniciar demo»): `updateConfig`, `setStock`, `setFailureMode`, `resetDemo`, `syncState`, `lookupCustomer`, `seedScenario`.
- Cédulas: solo números inventados para la demo (nunca reales); no se usan como clave interna ni se guardan en eventos.
- Promoción = lista de productos con precio promocional; el descuento aplica a 1 unidad de cada producto cubierto que esté en la factura. La promoción se sugiere por afinidad/objetivo/prioridad y solo descuenta si hay productos cubiertos en la factura.
- Veredicto de campaña (lectura preliminar y observacional): mínimo 3 presentaciones y meta de 50 % de compra tras exposición; «funciona» (verde) o «falló» (advertencia). No es evidencia causal. «Evidencia suficiente para elegir ganadora» sigue requiriendo ≥ 30 presentaciones por opción y comparación controlada.
- Botones «Ejemplo: campaña que funciona/falla» en resultados generan 9 ventas de ejemplo (ficticias) pasando por las mismas reglas.
- Sin formulario en el llamado al piloto (no hay backend ni captura de datos).

## Alcance y límites

No se afirma aumento de participación de mercado ni rentabilidad. No se recomiendan tratamientos ni se infieren enfermedades. IDs internos ficticios; las cédulas de la demo son inventadas. La contribución mostrada es simulada y observacional.
