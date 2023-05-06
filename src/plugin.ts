import { AcceptedPlugin, Plugin, postcss, ProcessOptions } from "./deps.ts";

const STYLE_ELEMENT_ID = "__FRSH_POSTCSS";

export interface Config {
  parser?: ProcessOptions["parser"];
  stringifier?: ProcessOptions["stringifier"];
  syntax?: ProcessOptions["syntax"];
  map?: ProcessOptions["map"];
  from?: string;
  to?: string;
  plugins?: AcceptedPlugin[];
}

export function freshPostcss(config: Config): Plugin {
  const {
    plugins,
    from = "./static/style.css",
    ...processOptions
  } = config;

  return {
    name: "postcss",
    render: (ctx) => {
      const res = ctx.render();

      if (res.requiresHydration) {
        const css = Deno.readTextFileSync(from);
        const cssText =
          postcss(plugins).process(css, { from, ...processOptions }).css;
        return {
          styles: [{ cssText, id: STYLE_ELEMENT_ID }],
          scripts: [],
        };
      }

      return {
        styles: [],
        scripts: [],
      };
    },
  };
}
