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

function createPlugin() {
  let cssText = "";

  const process = async (config: Config = {}) => {
    const {
      plugins,
      from = "./static/style.css",
      to,
      ...processOptions
    } = config;
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

  const freshPostcss = (config: Config = {}): Plugin => {
    if (config.to) {
      console.warn(
        yellow("Warning (fresh_postcss):"),
        'Using the "to" option will write a file using "Deno.writeFile".\n',
        "It may work locally, but will not work with Deno Deploy.\n",
        "https://deno.com/deploy/docs/runtime-fs\n",
      );
    }

    void process(config);

    return {
      name: "postcss",
      render: (ctx) => {
        const res = ctx.render();

        if (res.requiresHydration) {
          // This will usually require double refresh for changes to be updated
          void process(config);
        }

        if (config.to) {
          return {
            styles: [],
            scripts: [],
          };
        }

        return {
          styles: [{ cssText, id: STYLE_ELEMENT_ID }],
          scripts: [],
        };
      },
    };
  };

  return { process, freshPostcss };
}

const { process, freshPostcss } = createPlugin();

export { freshPostcss, process };
