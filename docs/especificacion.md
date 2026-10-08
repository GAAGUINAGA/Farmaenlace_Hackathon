# Especificación del MVP de inteligencia en primera línea para Farmaenlace

**Horizonte de construcción:** 180 minutos desde el inicio del equipo.  
**Equipo:** tres personas.  
**Decisión:** construir una aplicación con un POS simulado, un motor de priorización y una vista de evidencia para la siguiente prueba comercial.

## 1 Propuesta de valor y resultado esperado

Conectamos los objetivos comerciales de cada familia de productos con las audiencias de Marketing y las respuestas en el mostrador, para priorizar acciones autorizadas y recomendar las siguientes pruebas comerciales.

El MVP debe demostrar un recorrido completo: el sistema recibe recomendaciones y promociones elegibles, incorpora el objetivo de una campaña y afinidades conocidas del cliente, propone una acción explicable y registra lo que ocurrió. Comercial consulta esos eventos para formular una prueba posterior. La aprobación de campañas y descuentos permanece en el proceso comercial.

La contribución se plantea como una hipótesis que debe comprobarse. El hackathon demuestra el mecanismo de decisión y captura de evidencia; no prueba aumento de participación de mercado, rentabilidad incremental ni mejora predictiva sobre clientes reales.

### Comparación con la operación descrita

| Capacidad | Operación reportada por el equipo | Aporte del MVP |
| --- | --- | --- |
| Analítica y recomendaciones | Ya existe inteligencia de negocios y recomendaciones por historial transaccional. | Consumir esas salidas como entrada; enriquecer su contexto y priorizar acciones. |
| Promociones | PromoGo presenta promociones aplicables; se reporta falta de priorización. | Seleccionar entre opciones autorizadas y explicar el orden. |
| Estrategia | Las líneas comerciales deciden a partir de negociación, mix de productos, ventas y objetivos de mercado. | Hacer explícito el objetivo y su prioridad en cada decisión del mostrador. |
| Comunicación | Marketing utiliza audiencias; La Voz Comercial comunica campañas y lineamientos. | Relacionar audiencia, campaña, promoción y mensaje autorizado. |
| Medición | Se reporta evaluación de canjes, retorno y rentabilidad. | Añadir el recorrido previo al canje: recomendación, presentación, respuesta y compra. Confirmar qué eventos ya existen. |

Estas capacidades se basan en las conversaciones compartidas por el equipo. Las interfaces reales y la disponibilidad de datos deben confirmarse con Comercial y TI.

## 2 Caso principal y límites de la entrega

**Caso principal:** durante una compra de cuidado personal, el dependiente recibe varias recomendaciones. El asistente identifica una promoción pertinente entre las elegibles, explica por qué la prioriza y captura la ejecución. Al consultar resultados, Comercial encuentra una propuesta concreta de prueba por audiencia y campaña.

| Construir durante los 180 minutos | Posponer |
| --- | --- |
| Dos o tres perfiles ficticios y afinidades de segmentos. | Construcción del golden record corporativo. |
| Una canasta editable y tres promociones de ejemplo. | Integración real con PromoGo, Vendix y La Voz Comercial. |
| Dos objetivos comerciales configurables y reglas de ranking. | Predicción de cuota de mercado y modelos de efecto causal. |
| Registro de eventos y confirmación simulada de compra. | Entrenamiento continuo con datos reales. |
| Resumen por campaña y propuesta de experimento. | Captura de redes sociales, identidad entre canales y campañas publicitarias. |
| Revalidación de condiciones al aplicar y pruebas básicas. | Llavero, cuidadores, nueva membresía, aliados y anti-merma. |

Usar categorías de cuidado personal de ejemplo. El sistema no recomienda tratamientos ni infiere enfermedades. Las promociones deben respetar su elegibilidad: una recomendación de baja prioridad no retira beneficios generales aplicables.

## 3 Casos de uso concretos

### CU1 Priorizar una acción durante la atención

**Actor:** dependiente. **Disparador:** una compra tiene cliente identificado, canasta y opciones comerciales disponibles.

**Entradas:** identificador del cliente ficticio; afinidades conocidas; canasta; local; recomendaciones de producto simuladas; promociones elegibles simuladas; ficha y versión de campaña.

**Proceso:** intersectar productos recomendados con promociones disponibles; validar reglas; puntuar candidatos válidos; seleccionar una acción; explicar señales utilizadas y condiciones. Si no hay candidato válido, devolver `no_offer`.

**Salida:** una tarjeta con producto, promoción, precio, explicación y mensaje aprobado. Mostrar también el listado original permite comparar la ayuda del asistente con la operación descrita.

**Aceptación:** la decisión cambia por una razón observable al modificar una afinidad, una prioridad o una restricción. La tarjeta nunca presenta un descuento inventado.

### CU2 Bloquear o actualizar una acción por condiciones comerciales

**Actor:** dependiente y sistema. **Disparador:** cambia la canasta, vence una campaña, se pierde elegibilidad o cambia stock.

**Entradas:** datos actualizados y reglas vigentes. **Proceso:** invalidar la recomendación anterior y recalcular. Antes de aplicar, comprobar otra vez las condiciones.

**Salida:** acción alternativa o ausencia de oferta, con motivo. **Aceptación:** ninguna promoción vencida, sin stock o fuera de membresía puede aplicarse aunque una recomendación previa la incluyera.

### CU3 Enriquecer el historial con una interacción

**Actor:** dependiente. **Disparador:** presenta, descarta o confirma una acción.

**Proceso:** guardar eventos separados y vincularlos a cliente, campaña, recomendación y versión de reglas. Una compra se confirma mediante una transacción, no mediante el botón de aceptación verbal.

**Salida:** historial de interacciones. No se reescribe automáticamente la identidad del cliente ni se cambia su segmento por una sola respuesta. **Aceptación:** `no presentada` no cuenta como rechazo; eventos repetidos no duplican métricas.

### CU4 Proponer la siguiente prueba a Comercial

**Actor:** responsable comercial o de Marketing. **Disparador:** abre la vista de resultados.

**Entradas:** objetivo, promociones y eventos por audiencia. **Proceso:** presentar conteos, denominadores y limitaciones; formular una comparación de acciones autorizadas. Cuando la evidencia es escasa, indicar que todavía es insuficiente para elegir una ganadora.

**Salida de ejemplo:** «Probar A frente a B en el segmento Wellness con condiciones comparables. Evaluar contribución por cliente asignado. Las respuestas observadas son exploratorias y no demuestran incremento».

**Aceptación:** la propuesta identifica audiencia, opciones, objetivo y métrica. No publica una campaña ni anuncia participación de mercado ganada.

## 4 Ejemplo único para construir y demostrar

Todos los nombres, afinidades, costos y condiciones siguientes son ficticios. El objetivo es probar decisiones, no representar las políticas reales de Farmaenlace.

| Promoción | Producto y condiciones | Precio habitual | Costo | Precio promocional | Contribución por unidad |
| --- | --- | ---: | ---: | ---: | ---: |
| A | Crema corporal; aprobada, stock disponible, cualquier cliente elegible. | US$12,00 | US$8,00 | US$10,00 | US$2,00 |
| B | Champú; aprobada, stock disponible, cualquier cliente elegible. | US$10,00 | US$6,00 | US$9,00 | US$3,00 |
| C | Jabón; aprobada y exclusiva para membresía activa en este ejemplo. | US$6,00 | US$3,00 | US$5,00 | US$2,00 |

Para simplificar, aplicar una sola promoción priorizada y una unidad en la demo. No implementar acumulación de descuentos. El precio final ya incorpora el descuento; no restarlo otra vez. Otros costos e incentivos son cero únicamente en este ejemplo, y deben modelarse si existen.

**Perfiles:** Rosa tiene afinidades conocidas de Wellness 0,8 y Prácticos 0,2; Luis tiene Wellness 0,2 y Prácticos 0,8. Ambos reciben inicialmente las recomendaciones de crema y champú. Las afinidades se precargan; no se infieren de medicamentos.

**Campaña:** asocia A a Wellness y B a Prácticos. El responsable configura objetivo, prioridades y mensajes permitidos. C sirve para probar membresía. La pertenencia a segmentos puede ser múltiple; una afinidad no equivale a una probabilidad de compra.

**Configuración reproducible:** objetivo inicial de ganar participación; prioridad 0,8 para A y B; crema y champú dentro de la categoría permitida «cuidado personal»; canasta inicial con una crema. Con las reglas de la sección 6, Rosa obtiene A = 86 y B = 41; Luis obtiene A = 56 y B = 71. Ambos perfiles carecen de membresía activa, por lo que C queda excluida. Estos resultados deben ser los primeros casos de verificación del motor.

**Secuencia de demo:** seleccionar Rosa y comparar lista original con acción A; seleccionar Luis con la misma canasta y observar la priorización de B; agotar stock de B y observar alternativa o descarte; presentar una acción y confirmar compra; abrir resultados y ver eventos y propuesta de prueba. Mantener cada cambio visible y explicar el motivo.

## 5 Entradas y estructura de datos

| Entidad | Campos mínimos | Origen productivo previsto |
| --- | --- | --- |
| Cliente | `customer_id`, afinidades, fuente y fecha de afinidad, membresía, métricas transaccionales autorizadas. | Golden record y salidas existentes de BI; por confirmar. |
| Recomendación existente | `customer_id`, SKUs recomendados, origen y fecha. | Motor transaccional existente; por confirmar. |
| Campaña | `campaign_id`, objetivo, estado, versión, audiencias, promociones asociadas, prioridad, mensaje autorizado. | Marketing y Comercial. |
| Promoción | `promotion_id`, estado, vigencia, SKUs, locales, membresía, condiciones de canasta, descuento, acumulación y topes. | PromoGo o fuente autorizada; por confirmar. |
| Contexto | `store_id`, fecha, canasta y stock; señal voluntaria de querer finalizar rápido si se utiliza. | POS e inventario. |
| Evento | `event_id`, `recommendation_id`, cliente, campaña, promoción, versión, tipo, fecha y transacción cuando exista. | Aplicación del MVP. |

Para los clientes sin afinidad conocida, utilizar canasta y prioridades generales. No asignar un segmento inventado. No usar cédula como clave de la demo; utilizar IDs ficticios.

En ese caso, el MVP fija el término de afinidad en cero y conserva los demás pesos, indicando «afinidad desconocida» en la explicación. No interpretar ese cero como desinterés del cliente ni comparar estos scores con probabilidades.

La ficha unificada o golden record conserva atributos provenientes de distintas fuentes. En producción, los eventos nuevos deberían entrar como registros trazables mediante el identificador corporativo, con permisos y reglas de calidad. El MVP solo construye un historial local; no une identidades ni promete integración corporativa ya realizada.

## 6 Motor de decisión y alcance predictivo

### Elegibilidad antes del ranking

1. Recibir recomendaciones y promociones candidatas.
2. Rechazar campañas no aprobadas y promociones fuera de condiciones.
3. Comprobar stock, membresía, canasta, vigencia y local.
4. Calcular contribución y comprobar el piso aprobado. En la demo usar US$1 por unidad como supuesto visible.
5. Puntuar únicamente candidatos válidos y seleccionar el primero.
6. Entregar razones y registrar la versión de la decisión.
7. Revalidar antes de confirmar la compra.

Un fallo de evaluación debe mostrar error y conservar el flujo normal de compra, sin fabricar una oferta. El dependiente puede omitir la recomendación.

### Ranking transparente para el MVP

Usar tres señales normalizadas de 0 a 1: afinidad con la audiencia objetivo, pertinencia de producto en la canasta y prioridad comercial. Los pesos siguientes son supuestos configurables, pendientes de aprobación; no son políticas observadas.

```text
Objetivo ilustrativo de ganar participación
score = 100 * (0,50 * afinidad + 0,30 * pertinencia + 0,20 * prioridad)

Objetivo ilustrativo de consolidar liderazgo
score = 100 * (0,30 * afinidad + 0,40 * pertinencia + 0,30 * prioridad)
```

Definir pertinencia sin improvisación: 1 si el SKU está en la canasta; 0,5 si coincide con una categoría permitida; 0 si no existe relación definida. Definir afinidad como el valor precargado del segmento objetivo de la campaña. La prioridad comercial está configurada por campaña y promoción. Empates se resuelven con una regla fija y visible; por ejemplo, mayor contribución y después ID.

Este score prioriza criterios; **no predice probabilidad ni incremento de ventas**. No llamar a sus pesos «modelo entrenado». Si una condición económica falla, ningún score la puede superar.

### Evolución predictiva después del MVP

Con eventos reales suficientes, sustituir o complementar el score con una estimación calibrada de compra tras exposición, dentro de una ventana definida. Evaluar en datos posteriores al entrenamiento y comparar con reglas simples; evitar usar resultados futuros como variables de entrada.

Predecir respuesta no identifica a quién la promoción hace comprar adicionalmente. Medir incremento requiere una comparación controlada; registrar solo las mejores ofertas crea sesgo de selección. El piloto debe incluir comparación o exploración acordada entre acciones elegibles, con control de presupuesto. Una nueva versión del modelo se evalúa antes de activar; no se aprende automáticamente de cada clic durante la demo.

## 7 Arquitectura y contrato de integración del equipo

Construir en el stack que ya dominan, preferentemente un solo proyecto con frontend y API propia. Evitar nuevos servicios cloud si dificultan completar el flujo. Persistir en un archivo JSON con escrituras serializadas o una base local sencilla que el equipo ya maneje; memoria sola es respaldo y debe declararse porque se pierde al reiniciar.

```text
Datos ficticios y ficha de campaña
                  |
POS simulado -> API -> elegibilidad -> ranking -> acción explicada
                  |                                 |
                  +---- eventos y transacciones <----+
                              |
                     vista de resultados
                              |
                     propuesta de prueba
```

**Contrato cerrado en los primeros 15 minutos:**

```json
{
  "request_id": "req-01",
  "customer_id": "c-rosa",
  "store_id": "s-01",
  "campaign_id": "camp-01",
  "basket": [{"sku": "sku-crema", "quantity": 1}]
}
```

`POST /api/recommendations` devuelve:

```json
{
  "recommendation_id": "rec-01",
  "decision": "offer",
  "campaign_id": "camp-01",
  "promotion_id": "promo-A",
  "sku": "sku-crema",
  "score": 86,
  "score_type": "configured_rules",
  "reasons": ["Afinidad conocida", "Producto en canasta", "Campaña aprobada"],
  "message": "Puede utilizar el beneficio de esta campaña en este producto.",
  "price_before_cents": 1200,
  "price_after_cents": 1000,
  "contribution_cents": 200,
  "rules_version": "v1"
}
```

El score de ejemplo corresponde a afinidad 0,8, pertinencia 1 y prioridad 0,8 con los pesos del primer objetivo. En `no_offer`, los campos de promoción y precios serán nulos y se incluirá el motivo.

| Endpoint | Uso |
| --- | --- |
| `GET /api/demo-data` | Obtener clientes, productos, campañas y estado inicial. |
| `POST /api/recommendations` | Calcular y almacenar recomendación. |
| `POST /api/events` | Registrar presentación, omisión o respuesta con ID único. |
| `POST /api/transactions` | Revalidar y confirmar compra simulada con ID único. |
| `GET /api/results` | Obtener conteos, contribución simulada y propuesta de prueba. |

Eventos mínimos: `recommended`, `presented`, `not_presented`, `accepted`, `declined`, `purchased`. Cada evento incluye recomendación, fecha y versión; compra añade transacción. Aceptación verbal no incrementa compras. Solicitudes repetidas con el mismo ID son idempotentes y no duplican eventos. Una canasta modificada genera una nueva decisión.

## 8 Vista de resultados y economía

Mostrar por campaña y audiencia: número de recomendaciones, presentaciones, respuestas conocidas y compras vinculadas. Los conteos son de oportunidades de interacción, no compradores únicos, salvo que se calcule explícitamente otra métrica.

```text
Tasa de presentación = presentadas / recomendaciones
Tasa de compra tras exposición = oportunidades con compra / presentadas
Contribución registrada = ingreso neto - mercadería - otros costos e incentivos
```

No computar tasas con denominador cero; mostrar «sin observaciones». Si una compra se relaciona con varias recomendaciones, deduplicar o definir atribución explícita; en el MVP permitir una sola recomendación aplicada por transacción.

La contribución registrada es simulada y observacional. No equivale a beneficio incremental. Una compra con precio normal 12 y costo 8 deja 4; con descuento a 10 deja 2. Si se habría comprado de todos modos, el descuento reduce contribución en 2.

**Propuesta de experimento:** utilizar una plantilla determinada por el objetivo. Para crecer, comparar A frente a B en una audiencia definida; para consolidar, comparar selección habitual frente al asistente. No generar una campaña distinta por cada cliente. Si hay pocas observaciones, indicar insuficiencia y proponer la prueba, sin elegir una ganadora.

En el piloto real, definir asignación aleatoria, periodo, costos, contaminación entre grupos y métrica principal con BI. Evaluar contribución por comprador asignado e incluir no aceptación, devoluciones y posible adelanto de compras. Para afirmar cuota ganada se necesita además un denominador externo de mercado comparable.

## 9 Reparto de responsabilidades y cronograma de 180 minutos

| Responsable | Construcción | Investigación que debe resolver | Cierre de su tarea |
| --- | --- | --- | --- |
| Persona 1 POS | Selector de cliente, canasta, listado original, tarjeta y botones; vista de resultados básica. | Qué información aparece en caja y qué acción resulta comprensible. | Puede recorrer compra, rechazo y ausencia de oferta sin romper la pantalla. |
| Persona 2 motor | Datos ficticios, filtros, ranking, API, eventos y métricas. | Restricciones, prioridades, integración y aporte económico. | Respuestas explicables y condiciones revalidadas; no duplicación. |
| Persona 3 negocio y pitch | Confirmar el caso, ficha de campaña, objetivos, propuesta de experimento, deck y video. | Quién define prioridades, si audiencias se asignan a personas y qué eventos ya existen. | Relato de 180 segundos y evidencia real versus simulado; entrega coordinada. |

Persona 1 puede empezar con un JSON fijo que respete el contrato. Persona 2 sustituye esa respuesta sin cambiar campos. Persona 3 entrega los textos de campaña y mensajes desde el primer bloque; coordina cambios entre ambos.

| Tiempo desde inicio | Persona 1 | Persona 2 | Persona 3 | Hito conjunto |
| --- | --- | --- | --- | --- |
| 0 a 15 min | Acordar pantalla y contrato. | Acordar fixtures y respuesta. | Cerrar objetivo y consultar mentor. | Alcance y contrato congelados. |
| 15 a 60 min | POS con respuesta fija. | Motor y almacenamiento básico. | Ficha de campaña y primeras diapositivas. | Primera recomendación explicada. |
| 60 a 105 min | Conectar API y acciones. | Eventos, compra y resultados. | Prueba comercial y guion. | Flujo completo desplegado. |
| 105 a 135 min | Corregir estados y errores. | Verificar filtros e idempotencia. | Revisar demo y transparencia. | Pruebas críticas pasan. |
| 135 a 160 min | Congelar UI y capturar. | Congelar motor y README. | Grabar video y ensayar. | Respaldo y deck listos. |
| 160 a 180 min | Verificar demo pública. | Verificar instrucciones y enlaces. | Enviar y comprobar recepción. | Entrega confirmada. |

Si falta tiempo, reducir la vista de resultados a una tabla y una plantilla de prueba. Si a los 105 minutos no hay conexión completa, eliminar cambios de objetivo en vivo y conservar un objetivo fijo. Preservar siempre filtros, explicación, registro y respaldo. El cronograma debe terminar antes del cierre oficial; ajustar T0 según el tiempo real disponible.

## 10 Preguntas indispensables y criterios de aceptación

### Preguntas rápidas al mentor

1. ¿Los segmentos de Comunicación son audiencias generales o atributos asignados a clientes? ¿Qué fuente y actualización tienen?
2. ¿Las recomendaciones por historial y promociones elegibles se obtienen del mismo sistema? ¿Qué identificadores podríamos recibir?
3. ¿La Voz Comercial ya expresa prioridad, objetivo y mensaje por campaña? ¿Quién puede aprobar criterios para ordenar recomendaciones?
4. ¿Seleccionar una promoción general requiere parametrización nueva por cliente? ¿Qué cambia cuando la oferta es exclusiva?
5. ¿Qué reglas de margen, stock, membresía y acumulación nunca pueden saltarse?
6. ¿Ya registran recomendaciones presentadas y rechazadas? ¿Qué resultado justificaría probar el asistente?

Si no hay respuesta, documentar el supuesto en el README y la demo. No convertir una hipótesis del equipo en una política de Farmaenlace.

### Pruebas de aceptación

- Dos afinidades diferentes con la misma entrada comercial producen un orden distinto cuando la regla lo justifica.
- Cambiar objetivo o prioridad recalcula la acción; el mensaje no inventa un beneficio.
- Promoción vencida, no aprobada, sin stock o fuera de membresía no se aplica.
- Un piso económico incumplido bloquea la oferta pese a su afinidad.
- Cliente sin segmento utiliza señales conocidas y no recibe una clasificación fabricada.
- Omitir una recomendación no se cuenta como rechazo; aceptar no se cuenta como compra.
- Reenviar evento o transacción no duplica resultados; modificar canasta obliga a revalidar.
- Vista de resultados indica datos ficticios, denominadores y ausencia de evidencia causal.

## 11 Pitch y entrega

**Historia:** Farmaenlace ya tiene analítica, recomendaciones y promociones. El dependiente recibe opciones que debe interpretar. El asistente incorpora intención comercial y afinidad conocida, prioriza una acción válida y registra la respuesta. Esa evidencia ayuda a Comercial a definir la próxima prueba.

| Tiempo del pitch | Contenido |
| --- | --- |
| 0 a 25 s | Problema confirmado y funcionamiento existente. |
| 25 a 45 s | Conexión entre campaña, segmento y recomendación. |
| 45 a 120 s | Demo con dos perfiles, restricción y registro de compra. |
| 120 a 160 s | Resultados, propuesta de experimento y límites del MVP. |
| 160 a 180 s | Solicitud de piloto con Comercial, Marketing, BI y TI. |

**Frase de valor:** «Conectamos la intención de Marketing y las prioridades comerciales con la atención: qué acción autorizada presentar ahora y qué evidencia utilizar para decidir la siguiente prueba».

**Real si está implementado:** interfaz, API propia, reglas, trazabilidad y persistencia. **Simulado:** clientes, afinidades, recomendaciones existentes, catálogo, campañas y conexión corporativa. **Futuro:** estimación predictiva validada, integración con golden record y evaluación de impacto. Ajustar la declaración al estado efectivo de entrega.

Entregar URL desplegada, repositorio reproducible, fixtures, contrato de API, cinco diapositivas, video de respaldo y README con las pruebas realizadas. Verificar desde otro navegador. Usar un respaldo local no demuestra continuidad offline del POS ni sincronización productiva.

## 12 Base de la especificación

El caso parte de las conversaciones del equipo con mentores y las aclaraciones posteriores: negociación por familias de productos, decisión comercial, comunicación por La Voz Comercial y recomendaciones transaccionales sin priorización ni enriquecimiento reportados. La transcripción compartida contiene errores; la integración propuesta requiere validación técnica.

Referencia documental: conversación adjunta del 8 de octubre de 2026, Pasted text.txt, identificador 3267aaa5-ba47-4732-abf9-be28185e01eb. La rúbrica compartida pondera valor 30, técnica 25, novedad 20, viabilidad 15 y claridad 10. Los pesos del ranking, precios, perfiles y ejemplos de este documento son decisiones ilustrativas del MVP, no datos reales ni resultados verificados de Farmaenlace.