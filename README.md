# ERROR 404 | Inteligencia comercial en primera línea para Farmaenlace

> **De múltiples señales comerciales a una única acción pertinente, autorizada, explicable y medible en el mostrador.**

> **ERROR 404 · Hackathon Farmaenlace/BYD · Octubre de 2026**  
> Documento de presentación estratégica y arquitectura de solución propuesta. **No sustituye al README técnico del repositorio ni constituye una propuesta económica aprobada.**

* **LINK REPO:** [https\://github.com/GAAGUINAGA/Farmaenlace\_Hackathon](https://github.com/GAAGUINAGA/Farmaenlace_Hackathon)  
* **LINK PAGINA:** [https\://farmaenlace-hackathon.onrender.com](https://farmaenlace-hackathon.onrender.com)&nbsp;

## 1\. Visión ejecutiva: convertir inteligencia disponible en ejecución efectiva

Farmaenlace ya cuenta con una infraestructura comercial y tecnológica relevante: un POS corporativo (Vendix/FarmaPOS), un motor propio de promociones (PromoGo), capacidades de inteligencia de negocios, información transaccional y mecanismos para comunicar estrategias y campañas. El desafío no es simplemente **generar más información**, sino convertir el conjunto de ofertas, prioridades, audiencias y lineamientos en **una decisión clara y válida en los segundos en que ocurre una atención**.

**CARF propone una capa de orquestación inteligente de la decisión comercial en primera línea.** Su misión es recibir las opciones permitidas por los sistemas corporativos, contextualizarlas con la canasta, el local, los objetivos de campaña y las afinidades disponibles del cliente, evaluar primero las restricciones obligatorias, **priorizar una oportunidad relevante** y explicar al dependiente por qué se sugiere. Después registra lo que efectivamente ocurrió para que Comercial y Marketing puedan comparar estrategias con evidencia y, en una etapa posterior, medir impacto incremental con un piloto controlado.

La diferenciación estratégica es clara: **PromoGo determina qué promociones pueden aplicarse; CARF propone cuál de las oportunidades elegibles conviene presentar primero, por qué y cómo evaluar su resultado.** La aprobación de descuentos, el cálculo final de precios y la autoridad sobre la transacción permanecen en los sistemas corporativos.

**Tesis de valor:** una organización no obtiene toda la utilidad de sus capacidades analíticas hasta que logra incorporarlas, de forma controlada y medible, a la operación diaria. CARF se concentra precisamente en ese último tramo entre la estrategia y la acción.

## 2\. Problema: una brecha de última milla en la decisión comercial

En una atención real convergen múltiples elementos: productos en canasta, recomendaciones de origen transaccional, promociones habilitadas, restricciones de vigencia e inventario, segmentos de Marketing, prioridades de familias comerciales y mensajes de campaña. Aunque cada componente puede existir por separado, **su coexistencia no garantiza que el dependiente reciba una prioridad contextualizada y comprensible**.

La brecha presenta cuatro dimensiones:

1. **Fragmentación de contexto.** La promoción elegible, la audiencia y el objetivo estratégico pueden existir en diferentes procesos y tiempos de actualización.  
2. **Sobrecarga en la primera línea.** Pedir al dependiente que compare varias alternativas mientras atiende una compra añade esfuerzo de interpretación a un proceso que debe continuar siendo ágil.  
3. **Desalineación potencial.** Una opción disponible no necesariamente es la más pertinente para la canasta, el cliente o la prioridad comercial definida para ese momento.  
4. **Visibilidad insuficiente del recorrido previo a la venta.** Medir exclusivamente canjes o ventas promocionadas no siempre permite saber qué se recomendó, si se presentó, si se rechazó o si realmente produjo un efecto adicional.

La documentación corporativa identifica la **«inteligencia en la primera línea»** como oportunidad: filtrar promociones, campañas, estrategias, lineamientos y procedimientos para convertirlos en una acción sencilla durante la atención. CARF materializa esa necesidad como un sistema de soporte a la decisión, no como un reemplazo de la experiencia del vendedor.

## 3\. Segmentos, usuarios y beneficiarios

| Actor | Necesidad | Valor propuesto |
| :---- | :---- | :---- |
| **Dependiente / personal de mostrador** | Recibir una indicación precisa, segura y rápida sin interpretar múltiples campañas. | Una tarjeta con acción priorizada, motivo, condiciones y opción de omitir. |
| **Comercial / gerencias de categoría** | Ejecutar prioridades por familia de productos y conocer qué alternativas funcionan. | Configuración gobernada del objetivo y lectura de resultados por campaña y categoría. |
| **Marketing** | Llevar mensajes y audiencias autorizadas a una interacción concreta. | Consistencia entre audiencia, objetivo, comunicación y ejecución en tienda. |
| **BI / analítica** | Distinguir exposición, respuesta y transacción para evaluar hipótesis. | Eventos estructurados y base para experimentos con medición causal. |
| **TI / seguridad / operaciones** | Integrar sin interrumpir ventas ni duplicar sistemas. | Capa desacoplada, con contratos, trazabilidad, degradación segura y controles de acceso. |
| **Cliente final** | Recibir una oferta relevante, comprensible y aplicable sin fricciones. | Experiencia comercial contextualizada; sin perfilamiento clínico ni recomendaciones terapéuticas. |

&nbsp;

La red no es homogénea. **Farmacias Económicas** y **Medicity** atienden segmentos con patrones comerciales distintos. La estrategia exige **configuración por marca, campaña y contexto**, no un único ranking universal. Los arquetipos de Marketing solo pueden influir en decisiones individuales cuando exista una vinculación real, autorizada y verificable con el cliente; nunca deben inferirse arbitrariamente.

## 4\. Propuesta de valor y diferenciación frente a soluciones existentes

| Componente existente o aproximación | Función principal | Qué añade CARF |
| :---- | :---- | :---- |
| **PromoGo** | Determina promociones y condiciones aplicables. | **No crea descuentos:** consume opciones autorizadas y prioriza la acción a presentar. |
| **Vendix / FarmaPOS** | Opera el cobro, la canasta y el flujo de venta. | Inserta una sugerencia no bloqueante, sujeta a revalidación del POS. |
| **Recomendaciones por historial / BI** | Identifica productos o afinidades a partir de datos disponibles. | Combina esas señales con campañas vigentes, contexto transaccional y restricciones. |
| **La Voz Comercial / Marketing** | Comunica campañas y lineamientos. | Estructura objetivo, prioridad, audiencia y mensaje dentro de la decisión. |
| **Reportes de ventas y canjes** | Informan resultados comerciales observados. | Registra además el recorrido **recomendación → presentación → respuesta → compra**. |
| **Reglas estáticas sin contexto** | Siguen una prioridad fija para todos. | Permite prioridades sensibles al objetivo y a las señales conocidas del caso. |

&nbsp;

**Por qué es una alternativa sólida para este problema:** parte de las capacidades ya instaladas, usa las promociones aprobadas como frontera de seguridad, evita exigir un modelo predictivo no validado para operar, hace auditable cada recomendación y diseña la medición desde el comienzo. Esa combinación ofrece un camino de menor dependencia funcional que construir un nuevo motor de promociones o reemplazar el POS, aunque su facilidad de integración real todavía debe verificarse.

## 5\. La lógica del modelo: una decisión en dos etapas

La fortaleza del enfoque no es prometer que una fórmula adivina quién comprará. Es **separar decisiones de cumplimiento obligatorio de decisiones de priorización**, una distinción esencial en un entorno transaccional.

### Etapa A — Elegibilidad: restricciones no negociables

Antes de calcular un score, CARF obtiene los candidatos autorizados y descarta aquellos que incumplen condiciones: campaña inactiva, vigencia vencida, local no habilitado, SKU no aplicable, canasta incompatible, inventario insuficiente, membresía ausente, restricción de acumulación o piso económico aprobado.

**Principio:** la elegibilidad es una condición previa. Una excelente afinidad comercial jamás convierte una promoción inválida en válida. Si no quedan candidatos, la respuesta correcta es **`no_offer`** y el proceso de compra continúa normalmente.

### Etapa B — Priorización: optimización multicriterio explicable

Para cada alternativa permitida, el MVP utiliza tres señales normalizadas entre 0 y 1:

- **Afinidad conocida con la audiencia objetivo:** señal comercial previamente disponible, no diagnóstico ni probabilidad de compra.  
- **Pertinencia respecto de la canasta:** relación verificable entre producto y contexto actual.  
- **Prioridad de campaña:** importancia asignada por Comercial, sujeta a aprobación y versión.

El motor configura la ponderación según el objetivo:

```
Objetivo ilustrativo: ganar participación
score = 100 × (0,50 × afinidad + 0,30 × pertinencia + 0,20 × prioridad)

Objetivo ilustrativo: consolidar liderazgo
score = 100 × (0,30 × afinidad + 0,40 × pertinencia + 0,30 × prioridad)
```

&nbsp;

La pertinencia es **1** cuando el SKU está en canasta; **0,5** cuando coincide con una categoría permitida; **0** cuando no existe relación configurada. Los empates se resuelven mediante criterios deterministas, como mayor contribución prevista por unidad válida y, después, identificador estable. Para afinidades desconocidas se utiliza el valor neutral operativo previsto en la especificación (`0`) y se muestra la ausencia de dato, **sin interpretarla como desinterés**.

Los coeficientes del MVP son **parámetros ilustrativos configurados por el equipo**, no pesos aprendidos de datos corporativos. El score indica **orden de prioridad relativo dentro de un contexto concreto**, no porcentaje de conversión, probabilidad calibrada ni beneficio causal.

### Ejemplo verificable: una canasta, dos decisiones razonadas

Supongamos una compra ficticia de cuidado personal. Una campaña asocia la promoción **A** (crema corporal) a Wellness y **B** (champú) a Prácticos; ambas tienen prioridad 0,8. Con la misma canasta inicial, Rosa tiene afinidades conocidas Wellness 0,8 y Prácticos 0,2; Luis tiene 0,2 y 0,8, respectivamente.

| Cliente simulado | A: crema corporal | B: champú | Prioridad producida |
| :---- | ----: | ----: | :---- |
| **Rosa** | **86** | 41 | A, por afinidad Wellness y presencia en canasta. |
| **Luis** | 56 | **71** | B, por mayor afinidad con Prácticos. |

&nbsp;

**El valor técnico de esta demostración es la consistencia y la sensibilidad contextual del algoritmo:** ante el mismo inventario de opciones, modifica el orden por una razón comprobable, permite reproducir el cálculo y puede explicar cada señal utilizada. Si B pierde stock, deja de competir antes del ranking; el sistema propone una opción alternativa elegible o devuelve `no_offer`. Esto prueba comportamiento funcional del motor de reglas, **no que se haya demostrado mayor venta en clientes reales**.

## 6\. Implementación productiva: recorrido paso a paso de una venta

La siguiente secuencia describe **arquitectura objetivo propuesta**, condicionada a revisión de las interfaces y permisos corporativos. No describe una integración que ya esté operativa en el hackathon.

**Paso 1 — Preparación y gobierno de campañas.** Comercial define un objetivo, marca, periodo, promociones asociadas y prioridades. Marketing valida el mensaje y las audiencias permitidas. El sistema conserva identificador, autor, fecha y versión de la configuración. **CARF no publica campañas ni modifica precios por iniciativa propia.**

**Paso 2 — Obtención de señales aprobadas.** La capa de integración consulta, mediante interfaces autorizadas, los candidatos de promoción de PromoGo, recomendaciones existentes, catálogo, existencias y atributos comercialmente permitidos del cliente. Cada fuente conserva su procedencia, marca temporal y disponibilidad. Si una señal no está autorizada o no existe, se prescinde de ella; nunca se inventa.

**Paso 3 — Activación contextual en el punto de venta.** Ante un evento apropiado del POS, CARF recibe un contexto mínimo de decisión: identificador técnico de solicitud, sucursal, canasta, campaña y referencia pseudonimizada del cliente cuando procede. El POS sigue siendo el dueño del flujo de facturación y del precio final.

**Paso 4 — Construcción del conjunto candidato.** El orquestador cruza productos recomendados, ofertas de campaña y contexto de canasta. El cruce reduce ruido: una opción ajena a la campaña o al escenario no se convierte artificialmente en recomendación personalizada.

**Paso 5 — Validación de reglas obligatorias.** Se comprueban vigencia, membresía, stock, elegibilidad, topes, acumulabilidad y contribución mínima definida. Las reglas críticas se verifican con fuentes autorizadas. Las ofertas inválidas se excluyen y se conserva la razón del descarte para auditoría.

**Paso 6 — Ranking determinista y explicable.** Únicamente las alternativas aptas reciben una puntuación según afinidad, pertinencia y prioridad. Se aplica desempate estable. La respuesta incluye score, tipo de score (`configured_rules`), versión de reglas y una explicación legible, como «coincide con una afinidad conocida» o «corresponde a un objetivo vigente».

**Paso 7 — Presentación no intrusiva.** El dependiente observa una única tarjeta principal con producto, promoción, condiciones y mensaje autorizado. Puede presentarla u omitirla sin interrumpir la venta. **La interfaz debe respetar un SLA de latencia acordado con Operaciones**, que aún no está confirmado.

**Paso 8 — Captura fiel de la interacción.** La instrumentación registra eventos diferenciados: `recommended`, `presented`, `not_presented`, `accepted`, `declined` y `purchased`. No presentar no equivale a rechazar; aceptar verbalmente no equivale a comprar. Cada evento lleva identificadores únicos, referencia a la decisión y versión de configuración. Reintentos idempotentes evitan duplicados.

**Paso 9 — Revalidación al finalizar.** Si cambia la canasta o se altera cualquier condición relevante, la sugerencia previa se invalida y se recalcula. Cuando llega el momento de aplicar el descuento, **el sistema transaccional responsable vuelve a validar el beneficio**. CARF no fuerza el cierre ni altera la autoridad de PromoGo/Vendix.

**Paso 10 — Persistencia y conciliación.** La plataforma productiva propuesta almacena eventos y transacciones en un repositorio compartido y auditable, con controles de acceso, timestamps e identificadores correlacionables. BI reconcilia las compras confirmadas con los eventos de exposición para evitar atribuciones dobles. **El prototipo actual todavía no tiene esta persistencia productiva.**

**Paso 11 — Panel de lectura comercial.** Las áreas responsables consultan el embudo de recomendaciones, presentaciones, respuestas y compras por campaña, marca o audiencia permitida. Se muestran tanto numeradores como denominadores y se advierte cuando el tamaño de observación es insuficiente.

**Paso 12 — Diseño de la siguiente prueba.** El sistema plantea una comparación entre acciones autorizadas para un público y objetivo definidos. Comercial decide si se ejecuta y BI diseña la evaluación. **Ningún clic o canje, por sí solo, prueba incremento causal.**

## 7\. Arquitectura objetivo: integración desacoplada y continuidad operacional

```
                 GOBIERNO COMERCIAL Y MARKETING
         Objetivos · campañas · versiones · mensajes
                              │
             FUENTES CORPORATIVAS AUTORIZADAS
  PromoGo · Vendix/FarmaPOS · BI · inventario · audiencias
                              │
                      CAPA DE INTEGRACIÓN
     Contratos · permisos · calidad de datos · observabilidad
                              │
                    ORQUESTADOR DE CARF
          Contexto de atención + opciones candidatas
                              │
                  FILTRO DE ELEGIBILIDAD
          Reglas críticas · stock · vigencia · margen
                              │
                  MOTOR DE PRIORIZACIÓN
          Afinidad + pertinencia + objetivo comercial
                              │
                EXPLICACIÓN Y TRAZABILIDAD
       Motivos · ID de decisión · versión · eventos
                         ↙          ↘
         VISTA NO INTRUSIVA      EVIDENCIA PARA BI
           EN EL POS           Embudo · calidad · pruebas
                         ↘          ↙
                   REVALIDACIÓN EN POS
            Aplicación autorizada y compra real
```

&nbsp;

**Decisiones de arquitectura defendibles:**

- **Separación de responsabilidades:** los motores corporativos continúan siendo la autoridad sobre promociones y transacciones; CARF gobierna la selección y exposición de una acción dentro de ese marco.  
- **Desacoplamiento por contratos:** la lógica de elegibilidad y ranking no depende de la interfaz visual concreta; facilita probarla, revisarla y evolucionarla.  
- **Degradación segura (`fail-open` para el proceso de venta, nunca para descuentos):** ante ausencia de respuesta, error o falta de conectividad, se omite el asistente y se conserva la operación normal; **jamás se aplica una promoción no validada**. El comportamiento debe homologarse con TI y el funcionamiento offline de Vendix.  
- **Auditabilidad y reproducibilidad:** una recomendación se puede reconstruir a partir de entradas registradas conforme a políticas de privacidad, fuentes, configuración versionada y razón de desempate.  
- **Minimización y autorización de datos:** solo se utilizan señales necesarias, autorizadas y de procedencia conocida. Se requieren pseudonimización, controles de acceso, políticas de conservación y revisión de seguridad.  
- **Compatibilidad por verificar:** Farmaenlace describe una arquitectura híbrida con Google Cloud y componentes mayoritariamente .NET. La solución final debe acomodarse a sus estándares; **no se presupone una nube, API abierta ni SDK disponible**.

## 8\. ¿Por qué este enfoque es técnicamente efectivo?

**1\. Reduce complejidad de decisión sin suprimir controles.** Convierte un conjunto de alternativas permitidas en una acción clara, delegando las prohibiciones y restricciones al filtro de elegibilidad. El dependiente no necesita inspeccionar un ranking completo para tomar una decisión operativa.

**2\. Ofrece explicabilidad desde el primer día.** Cada resultado se descompone en señales conocidas y pesos versionados. A diferencia de un modelo opaco introducido prematuramente, este enfoque permite que Comercial discuta criterios, que TI reproduzca resultados y que un auditor entienda por qué se mostró una oferta.

**3\. Funciona incluso sin un perfil individual completo.** Con afinidad no disponible puede apoyarse en la canasta y la prioridad comercial, dejando explícito qué información faltó. No requiere fabricar segmentos ni obtener datos sensibles para entregar un ranking básico.

**4\. Es comprobable con pruebas deterministas.** Cambios en afinidad, objetivo, stock o membresía deben producir modificaciones observables; una restricción dura impide la aplicación aunque el score sea elevado. Las reglas pueden validarse con pruebas automáticas y escenarios límite.

**5\. Produce evidencia más informativa que un simple canje.** Separar recomendación, exposición y compra permite diagnosticar si un bajo resultado se debe a que no hubo ofertas válidas, el dependiente no la presentó o el cliente no compró. Este diagnóstico no equivale por sí mismo a causalidad, pero mejora el diseño de las pruebas.

**6\. Admite una evolución disciplinada hacia modelos estadísticos.** El ranking inicial constituye un **baseline** transparente. Con datos reales y una experimentación adecuada se pueden entrenar, calibrar y comparar alternativas, siempre sobre el mismo conjunto de promociones elegibles.

**La afirmación precisa es que CARF constituye un enfoque sólido y verificable para cerrar la brecha identificada; todavía no se ha demostrado que sea superior a todas las alternativas ni que produzca rentabilidad incremental.** Esa superioridad se debe establecer en un entorno controlado.

## 9\. Evolución: del motor experto a una inteligencia predictiva validada

La palabra «inteligencia» describe aquí una capacidad de **orquestación contextual y decisión basada en reglas**, no la existencia de un modelo de machine learning ya entrenado. Un despliegue posterior puede incorporar modelos predictivos si la calidad y el volumen de datos lo justifican.

**Fase predictiva propuesta:** construir un conjunto histórico que vincule contexto anterior a la decisión, opciones elegibles, exposición real y resultado dentro de una ventana definida. Separar entrenamiento, validación y prueba por tiempo; excluir variables que revelen el futuro; evaluar calibración, estabilidad, sesgo y rendimiento frente al ranking por reglas.

**Predicción no es causalidad.** Una estimación de probabilidad de compra después de exposición puede privilegiar personas que ya iban a comprar. Para seleccionar acciones que **generen valor adicional**, la evidencia debe evolucionar hacia ensayos aleatorizados y, solo cuando existan datos y supuestos adecuados, métodos de estimación de efectos heterogéneos o *uplift*. La función objetivo deberá considerar la **contribución neta incremental**, y no solo la conversión o los canjes.

**Gobernanza del cambio:** cada modelo o nueva parametrización requiere validación previa, revisión de Comercial y TI, despliegue gradual, monitoreo de deriva, métricas de seguridad y capacidad de reversión. No corresponde aprender automáticamente de cada clic del MVP.

## 10\. Medición: demostrar impacto económico en vez de confundir correlación con resultado

El sistema hace visibles dos planos distintos:

### Métricas operativas y observacionales

| Indicador | Definición | Interpretación válida |
| :---- | :---- | :---- |
| Tasa de presentación | Acciones presentadas / recomendaciones registradas elegibles según definición del experimento. | Adopción en mostrador; no impacto económico. |
| Respuesta tras exposición | Aceptaciones y rechazos entre presentaciones con respuesta. | Señal operacional; no conversión definitiva. |
| Compra tras presentación | Oportunidades con compra vinculada / acciones presentadas. | Conversión observada, sujeta a selección y atribución. |
| Proporción `no_offer` | Decisiones sin alternativa válida / decisiones evaluadas. | Disponibilidad y calidad de elegibilidad. |
| Latencia de decisión | Tiempo desde solicitud hasta respuesta u omisión segura. | Impacto técnico sobre el flujo operativo. |
| Incidencias de aplicación | Promociones inválidas aplicadas. | **Meta de control: cero**; verificar en piloto. |

&nbsp;

### Métrica económica causal principal

> **Δ contribución neta por canasta elegible asignada \= media del grupo tratamiento − media del grupo control.**

La comparación se define **antes de observar el resultado**, incorpora compras sin aceptación, descuentos, costo de mercadería, devoluciones e incentivos y evita atribuir a CARF una compra que habría ocurrido de cualquier forma. Ejemplo ficticio: un producto de precio habitual USD 12 y costo USD 8 aporta USD 4; con promoción a USD 10 aporta USD 2\. Si la venta habría sucedido igualmente, **el descuento resta USD 2 de contribución** aunque se registre como «venta promocionada».

Para evaluar cuota de mercado se necesitaría, adicionalmente, una referencia comparable del mercado total, que no está disponible en el material entregado.

## 11\. Viabilidad: evidencia corporativa, hipótesis y límites

El documento de prefactibilidad cita **1.422 puntos de venta en 2025** (744 propios y 678 franquicias), presencia en **23 provincias** y una referencia corporativa de **172.000 transacciones diarias** en el ecosistema de punto de venta. Estos datos sostienen la **relevancia de escala** y la necesidad de diseñar para una red distribuida, pero **no indican cuántas transacciones reales serán elegibles** ni el beneficio que producirá CARF.

La evaluación económica utiliza, como **supuestos ilustrativos no cotizados**, USD **120.000** de implementación, USD **5.000 al mes** de operación, **20 %** de elegibilidad y un despliegue escalonado hasta **300 locales tratados** durante el primer año. Bajo ese escenario, se modelan **1.469.620 canastas elegibles** en el año 1\. El efecto hipotético central de **USD 0,04 netos por canasta elegible** daría aproximadamente **USD 58.785 de beneficio bruto incremental modelado en el primer año**, frente a **USD 180.000** de implementación y operación supuestas, con **flujo acumulado de −USD 121.215**. La recuperación aritmética se sitúa alrededor del **mes 45**, con las condiciones expresas del estudio. **No es una predicción, una cotización ni un ROI garantizado.**

El escenario modelado de **USD 0,02** no cubriría el costo operativo mensual al estabilizarse en 300 tiendas; el de **USD 0,06** alcanzaría una recuperación aproximada en el mes **24** bajo los mismos supuestos. En el primer año, el umbral calculado para cubrir todos los costos asumidos es **USD 0,122 por elegible**; en operación estabilizada, el umbral de OPEX es **USD 0,023 por elegible**. Esto demuestra por qué se necesita evidencia **antes** de autorizar un despliegue masivo.

**Viabilidad funcional:** el equipo ya construyó un prototipo navegable para ilustrar decisiones y eventos. **Viabilidad de integración:** prometedora por el ecosistema existente, pero sujeta a interfaces, permisos, seguridad y validación en POS. **Viabilidad comercial:** la necesidad está identificada; la ventaja económica incremental aún debe medirse. **Viabilidad financiera:** condicional; requiere costos aprobados y pruebas causales.

## 12\. Piloto recomendado: medir antes de escalar

**Diseño propuesto, no aprobado:** 90 días en **50 locales**, seleccionados por marca, región y volumen, con asignación aleatoria cuando sea viable: **25 con CARF y 25 en control habitual**. El equipo de BI debe realizar el análisis de potencia estadística y el efecto mínimo detectable con datos históricos: 25 locales por brazo **no garantizan significancia**.

El piloto debe verificar simultáneamente:

- **Integridad comercial:** validez de promociones, stock, membresía, reglas de acumulación y contribución.  
- **Integridad operativa:** latencia, ausencia de bloqueo de venta, continuidad y reconciliación de eventos.  
- **Integridad analítica:** asignación, calidad de datos, denominadores, contaminación entre grupos y devoluciones.  
- **Integridad económica:** diferencia de contribución neta por canasta asignada, intervalos de confianza y costos reales.  
- **Adopción:** cuándo el dependiente recibe, presenta u omite la indicación, por qué y con qué fricción.

**Criterio de avance:** escalar únicamente si la solución es segura, operativamente aceptable y el efecto incremental estimado justifica los costos verificados con incertidumbre razonable. Si no ocurre, ajustar criterios, segmentos o alcance y volver a medir; no interpretar un resultado nulo como autorización automática para escalar.

## 13\. Ruta de implantación real

| Etapa | Objetivo | Entregable / puerta de decisión |
| :---- | :---- | :---- |
| **0\. Descubrimiento y permisos** | Confirmar interfaces, flujos POS, PromoGo, inventario, datos de cliente, SLA y requisitos de seguridad. | Mapa de sistemas, contratos viables y riesgos aceptados por TI y Comercial. |
| **1\. Homologación y diseño** | Acordar reglas, mensajes, contribución, eventos, permisos, idempotencia y modo seguro de fallo. | Especificación productiva verificable y plan de pruebas. |
| **2\. Entorno de integración** | Conectar fuentes autorizadas en ambiente de prueba y conciliar resultados con el POS. | Pruebas de contrato, restricciones, latencia y trazabilidad. |
| **3\. Piloto controlado** | Evaluar adopción e impacto con un grupo de comparación. | Informe de BI con resultados, incertidumbre y costos reales. |
| **4\. Escalamiento gradual** | Extender por marca, región y cohortes solo donde exista justificación. | Aprobaciones por etapas y mecanismos de rollback/monitoreo. |
| **5\. Optimización avanzada** | Investigar ranking predictivo o uplift con evidencia suficiente. | Modelo validado frente al baseline, no sustitución automática. |

&nbsp;

## 14\. Qué demuestra hoy el repositorio y qué corresponde al futuro

**Implementado y demostrable en el prototipo público:** interfaz de POS simulado, escenarios ficticios, motor de filtros duros y score configurado, explicación de decisiones, captura de eventos, resultados exploratorios, pruebas automatizadas documentadas y persistencia local del navegador. En el repositorio, `src/engine` concentra la lógica; `src/api` expone un **contrato simulado en el cliente**; `src/data` contiene los datos ficticios; las vistas del POS y resultados consumen esa capa. **No existe un backend corporativo ni conexión a las plataformas reales.**

**Limitaciones que deben reconocerse expresamente:** la «API» de la demo es un módulo del navegador con latencia simulada; `localStorage` no sincroniza datos entre terminales; clientes, cédulas de ejemplo, campañas, costos, inventarios y afinidades son ficticios. El panel presenta **indicadores observacionales de demostración**, no rentabilidad causal. Sus umbrales de «funciona/falla» son criterios didácticos del prototipo, no una validación estadística de campañas reales.

**Por construir para producción:** persistencia corporativa centralizada, APIs o integraciones homologadas, autorización y auditoría empresarial, supervisión operativa, integración de datos autorizados, reconciliación contra transacciones reales, pruebas de carga/seguridad y un experimento causal aprobado.

Esta transparencia es una ventaja ante evaluadores técnicos: **el equipo diferencia claramente la prueba de concepto, la arquitectura objetivo y la evidencia necesaria para una decisión de inversión.**

## 15\. Riesgos y respuestas de diseño

| Riesgo | Estrategia de mitigación |
| :---- | :---- |
| Repetir funcionalidades de PromoGo | Mantener PromoGo como autoridad de promociones; CARF solo prioriza su exposición. |
| Promoción inválida o inventario desactualizado | Filtros previos y **revalidación transaccional** antes de aplicar. |
| Lentitud del POS / falta de conectividad | Tiempo máximo definido con Operaciones, omisión segura y continuidad de caja. |
| Afinidad ausente o desactualizada | Procedencia y vigencia registradas; ranking con señales disponibles, sin inventar perfil. |
| Descuentos que canibalizan ventas normales | A/B por contribución neta asignada, no conteo de canjes. |
| Sesgos y privacidad | Minimización de datos, permisos, pseudonimización, revisión humana y monitoreo por segmentos permitidos. |
| Escalamiento sin pruebas | Implementación condicionada a métricas y aprobaciones por etapas. |
| Confundir demo con producción | Separación explícita entre componentes simulados, arquitectura propuesta e integraciones verificadas. |

&nbsp;

## 16\. Narrativa para jurados y decisores

**¿Por qué este proyecto y no otro sistema de promociones?** Porque la organización no necesita duplicar la lógica que ya autoriza descuentos. Necesita asegurar que una promoción válida, una prioridad comercial y un contexto de atención se conviertan en una **acción priorizada, consistente y comprensible**. CARF opera en esa frontera y registra la evidencia que permite aprender de ella.

**¿Por qué es técnicamente defendible?** Porque adopta una secuencia auditable de **validar → priorizar → explicar → registrar → revalidar → medir**. Es reproducible, desacoplada, sensible al contexto y explícita respecto de sus límites. Evita que un algoritmo optimice por encima de reglas corporativas.

**¿Por qué es escalable en concepto?** Porque los criterios se expresan como reglas y configuraciones versionadas, mientras que los sistemas corporativos siguen siendo la fuente de verdad. Se puede probar una marca o cohorte antes de extender el alcance, siempre que TI confirme contratos, desempeño y operatividad.

**¿Por qué tiene una justificación comercial seria?** Porque enfoca la evaluación en **contribución incremental neta**, reconoce el riesgo de canibalización y propone un ensayo controlado. Los números del estudio son escenarios de planificación, no una promesa financiera.

> **Mensaje final:** *Farmaenlace ya posee las piezas de la inteligencia comercial. CARF propone el mecanismo que las coordina justo donde se decide la experiencia: en primera línea. No queremos multiplicar ofertas, sino convertir la información disponible en una acción segura y explicable; ni queremos celebrar cada descuento aplicado, sino demostrar, mediante evidencia causal, cuáles decisiones generan valor adicional para la empresa y sus clientes.*

## 17\. Fuentes, trazabilidad y cautelas

1. **Farmaenlace y BYD**, *Hackaton \- Farmaenlace/BYD \- Reto* (material corporativo facilitado al equipo, octubre 2026), citado en el estudio: pp. 7, 12–13, 17, 23–24, 27–32 y 50\. Su disponibilidad pública no se presume.  
2. **Developers CARF**, *Evaluación económica y viabilidad financiera actualizada: Copiloto de Inteligencia en Primera Línea para Farmaenlace*, v2.0, 8 de octubre de 2026\. Fuente de escenarios y clasificación de evidencia; **documento de prefactibilidad, no presupuesto cotizado**.  
3. **Developers CARF**, *Especificación del MVP de inteligencia en primera línea para Farmaenlace*, 8 de octubre de 2026\. Reglas, escenarios y criterios de demostración.  
4. **Repositorio público del prototipo:** [GAAGUINAGA/Farmaenlace\_Hackathon](https://github.com/GAAGUINAGA/Farmaenlace_Hackathon). Consultado el 8 de octubre de 2026\.  
5. **Farmaenlace**, [Informe de Sostenibilidad 2024](https://www.farmaenlace.com/wp-content/uploads/2025/06/Informe-Farmaenlace-web-2024.pdf). Referencia histórica, **no sustituto de las cifras 2025**.

**Nota de rigor:** toda cifra de costo, elegibilidad, crecimiento o recuperación incluida como escenario debe tratarse como hipótesis de prefactibilidad hasta contar con datos POS, contratos, cotizaciones y una evaluación de impacto. La documentación disponible **no demuestra superioridad causal del motor frente a otras estrategias, integración operativa real ni ROI garantizado**.