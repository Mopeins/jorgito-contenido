# Central de Contenido · Jorgito Parrillero

Web app para gestionar el contenido de Jorgito. Usa el mismo stack que Despensapp: **Expo + React Native Web**, con **Supabase** para la base de datos y el login, y **EAS Hosting** para publicar.

## Qué trae

- **Hoy:** lo que se viene en 30 días, lo que hay que grabar o publicar esta semana, las propuestas pendientes y el radar.
- **Calendario:** más de 40 efemérides de cocina (Chile, internacionales y de Latam para versus), los estrenos y fechas propias. Desde cada fecha se generan ideas.
- **Tablero de ideas:** un kanban que va de Idea → Aprobada → Guion → Por grabar → Edición → Publicada.
- **Ficha de cada idea:**
  - **Flujo de trabajo:** 8 pasos base con responsable, fecha límite y registro de quién lo hizo. Se pueden agregar pasos.
  - **Propuestas:** las dejan la IA o el equipo y quedan pendientes. Al aceptar una de título, gancho, guion o cierre, reemplaza ese campo.
- **Generador IA:** ideas por pilar, Día D (receta, truco y versus) y Mundial por llaves.
- **Radar:** hallazgos de los referentes, que se convierten en ideas con un clic.
- **Métricas:** registro semanal (la IA lee pantallazos), un gráfico de seguidores y el informe semanal.
- **Acceso:** se entra con la clave del equipo (cuenta compartida `equipo@jorgitoparrillero.cl`, admin). Quien tenga su propio correo en la lista de Equipo también puede entrar con un código al correo.

## Cómo se publica

Cada cambio que se guarda en `main` publica la web sola (`.github/workflows/version-web.yml`) en https://jorgito-contenido.expo.app.
Para eso necesita el secreto `EXPO_TOKEN` en GitHub → Settings → Secrets and variables → Actions.

## Ajustes únicos en Supabase (proyecto `jorgito-contenido`)

1. **IA:** la app no llama a la IA directo. Los botones dejan pedidos en la tabla `solicitudes` y la tarea programada "Cola de pedidos Jorgito" (con el plan de Claude) los resuelve cada hora entre 8:00 y 23:00. La función `ia` queda lista por si algún día se quiere respuesta instantánea con `ANTHROPIC_API_KEY`.
2. **Correo con código:** en Authentication → Emails → Magic Link, pon el código en el texto, por ejemplo `Tu código para entrar a la Central de Contenido es {{ .Token }}`.
3. **Dirección de la web:** en Authentication → URL Configuration, pon `https://jorgito-contenido.expo.app` como Site URL.

## Desarrollo

```bash
npm install
npx expo start --web
npx tsc --noEmit && npx expo lint
```

El esquema de la base de datos está en `supabase/schema.sql` y la función de IA en `supabase/functions/ia/`.
