# fresh_postcss

[Fresh](https://fresh.deno.dev/) plugin for [PostCSS](https://postcss.org/)
integration

## Usage

```ts
// main.ts
import autoprefixer from "https:/esm.sh/autoprefixer@10.4.14";

import { start } from "$fresh/server.ts";
import freshPostcss from "$fresh_postcss/mod.ts";

import manifest from "./fresh.gen.ts";

await start(manifest, {
  plugins: [
    freshPostcss({
      plugins: [
        autoprefixer(),
      ],
    }),
  ],
});
```

⚠️ **DO NOT** import CSS files directly in your code! ⚠️

The plugin will search your directory for CSS files, and the CSS will
automatically be injected into `<head>`. You can also specify the files using
glob syntax.

```ts
// main.ts
await start(manifest, {
  plugins: [
    freshPostcss({
      include: ["static/**/*.css"],
      exclude: ["static/_generated/**/*"],
    }),
  ],
});
```
