# PostCSS Plugin for Deno Fresh

Process styles through PostCSS in your Fresh project.

## Usage

```ts
// postcss.config.ts
import autoprefixer from "https:/esm.sh/autoprefixer@10.4.14";

const config = {
  plugins: [
    autoprefixer(),
  ],
};

export default config;
```

```ts
// main.ts

import { start } from "$fresh/server.ts";
import freshPostcss from "$fresh_postcss/mod.ts";

import manifest from "./fresh.gen.ts";
import postcssConfig from "./postcss.config.ts";

await start(manifest, {
  plugins: [freshPostcss(postcssConfig)],
});
```

## Limitations

### File output

Currently only style injection is supported.

### No async plugins

Fresh plugins are synchronous only, so the functionality is highly limited. This
also means that async plugins for PostCSS (such as `preset-env`) will not work.

Related: https://github.com/denoland/fresh/issues/728

We won't be able to relegate async functionality to the `scripts` because
PostCSS is not built for a browser context. It would also be a step backwards
when we're trying to do as much SSR as possible.

### Not all config formats are supported

Currently unable to use
[`postcss-load-config`](https://github.com/postcss/postcss-load-config). One of
the (indirect) dependencies down the line fails due to an error on
`cspotcode/node-source-map-support`.

A `Config` type is exported, which is a subset of `Config` from
`postcss-load-config`.

Related: https://github.com/cspotcode/node-source-map-support/issues/43
