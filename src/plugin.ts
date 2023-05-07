import {
  AcceptedPlugin,
  Plugin,
  postcss,
  ProcessOptions,
  yellow,
} from "./deps.ts";

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
    to,
    ...processOptions
  } = config;

  let cssText = "";

  if (to) {
    console.warn(
      yellow("Warning (fresh_postcss):"),
      'Using the "to" option will write a file using "Deno.writeFile".\n',
      "It may work locally, but will not work with Deno Deploy.\n",
      "https://deno.com/deploy/docs/runtime-fs\n",
    );
  }

  const process = async () => {
    const css = await Deno.readTextFile(from);

    if (to) {
      const fileContent =
        (await postcss(plugins).process(css, { from, to, ...processOptions }))
          .css;

      // Note that this does not work
      Deno.writeTextFile(to, fileContent);
    } else {
      cssText =
        (await postcss(plugins).process(css, { from, to, ...processOptions }))
          .css;
    }
  };

  void process();

  return {
    name: "postcss",
    render: (ctx) => {
      const res = ctx.render();

      if (res.requiresHydration) {
        void process();
      }

      return {
        styles: [{ cssText, id: STYLE_ELEMENT_ID }],
        scripts: [],
      };
    },
  };
}
