@AGENTS.md

# FarmaPOS — MVP de priorización de promociones
Base: el stack y el estilo visual del proyecto Bocadoo. El contenido es nuevo.
Fuente de verdad: docs/especificacion.md. Si algo no está ahí, pregunta; no lo inventes.

## Alcance
- Landing + prototipo POS embebido, interactivo y con estado local. Sin backend.
- Motor de ranking simulado en el navegador: reglas reales de la spec (filtros, score, desempate), datos ficticios.
- Capas: engine (reglas puras y pruebas) → api (contrato de la sección 7, retardo simulado, localStorage) → UI. La UI llama solo a api.
- El score es "configured_rules", no un modelo predictivo.

## Reglas
- Banner visible: "Datos ficticios · prototipo · motor de reglas simulado".
- La UI muestra solo lo que devuelve la API. Nunca inventes descuentos, precios ni mensajes.
- No afirmar aumento de participación de mercado ni rentabilidad.
- No recomendar tratamientos ni inferir enfermedades. Sin cédulas; IDs ficticios.
- Dinero en centavos (enteros). UI en español.
- Aceptar verbalmente no es comprar; "no presentada" no es rechazo.
- Reutiliza los componentes y el estilo existentes antes de crear otros nuevos.