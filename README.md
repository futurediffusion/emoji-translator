# Emoji Translator

Emoji Translator es una aplicación web construida con **Next.js** que traduce frases a emojis y genera tableros simétricos con ellos. Es una herramienta experimental pensada para divertirse comunicándose solo con íconos.

## Funcionalidades

- **Emoji Translator**: convierte un texto en una línea de emojis usando la API *Gemini* de Google.
- **Emoji Grids**: crea cuadrículas simétricas a partir de los emojis proporcionados o generados.

## Requisitos

Necesitas Node.js 18 o superior. Si cuentas con una clave de la API de Gemini, defínela en la variable de entorno `GEMINI_API_KEY` para obtener mejores resultados. Sin ella se emplea una clave de demostración incluida en el código.

## Puesta en marcha

Instala las dependencias y lanza el servidor de desarrollo:

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) para ver la aplicación.

## Estructura básica

- `src/app` contiene las páginas y rutas de la aplicación.
- `src/lib` aloja funciones auxiliares para procesar y generar emojis.

## Despliegue

Ejecuta `npm run build` y luego `npm start` para servir la versión compilada. Puedes publicarla en cualquier proveedor compatible con Node.js, por ejemplo **Vercel**.

---

Proyecto inicializado con [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) y estilizado con **Tailwind CSS**.
