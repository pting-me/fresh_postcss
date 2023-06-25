import {
  expandGlob,
  FreshPlugin,
  PluginRenderStyleTag,
  postcss,
  PostcssPlugin,
  ProcessOptions,
} from "./deps.ts";

const STYLE_ELEMENT_ID_PREFIX = "__FRSH_POSTCSS__";

/**
 * Plugin options for the Fresh PostCSS Plugin
 */
export interface Options {
  /**
   * PostCSS Parser
   * @see {@link https://github.com/postcss/postcss/blob/15c5f61aa6f72df51f78dbda724b044f616be4fe/docs/syntax.md#parser PostCSS Docs - Parser}
   */
  parser?: ProcessOptions["parser"];
  /**
   * PostCSS Stringifier
   * @see {@link https://github.com/postcss/postcss/blob/15c5f61aa6f72df51f78dbda724b044f616be4fe/docs/syntax.md#stringifier PostCSS Docs - Stringifier}
   */
  stringifier?: ProcessOptions["stringifier"];
  /**
   * PostCSS Syntax
   * @see {@link https://github.com/postcss/postcss/blob/15c5f61aa6f72df51f78dbda724b044f616be4fe/docs/syntax.md#stringifier PostCSS Docs - Syntax}
   */
  syntax?: ProcessOptions["syntax"];
  /**
   * Specifies an array of glob patterns to be processed. Defaults to `["**\/*.{css,sss,pcss}"]`
   */
  include?: string[];
  /**
   * Specifies an array of glob patterns that should be skipped when resolving `include`.
   */
  exclude?: string[];
  /**
   * Specifies an array of PostCSS plugins.
   */
  // TODO: Figure out a better typing convention
  // Currently explicitly tying this to `AcceptedPlugin` will break if there's a minor version mismatch.
  plugins?: unknown[];
}

function createElementId(path: string) {
  const cwd = Deno.cwd();
  const relativePath = path.startsWith(cwd) ? path.substring(cwd.length) : path;

  // remove leading slashes
  const pathIndex = relativePath.search(/[^/]/);

  if (pathIndex === -1) {
    return STYLE_ELEMENT_ID_PREFIX;
  }

  return STYLE_ELEMENT_ID_PREFIX +
    relativePath.substring(pathIndex).replaceAll(/[^A-Za-z0-9]+/g, "_")
      .toUpperCase();
}

function freshPostcss(config: Options = {}): FreshPlugin {
  const {
    include = ["**/*.{css,sss,pcss}"],
    exclude,
    plugins,
    ...processOptions
  } = config;

  const styles: PluginRenderStyleTag[] = [];

  return {
    name: "postcss",
    renderAsync: async (ctx) => {
      const res = await ctx.renderAsync();

      if (res.requiresHydration) {
        styles.length = 0;

        const elementIds = new Set<string>();
        const filePaths = new Set<string>();

        // Need to iterate through include for now
        // https://github.com/denoland/deno_std/issues/3465
        for (const glob of include) {
          for await (const file of expandGlob(glob, { exclude })) {
            if (filePaths.has(file.path)) {
              continue;
            }

            filePaths.add(file.path);

            // Read and process CSS file
            const css = await Deno.readTextFile(file.path);
            const cssText = (await postcss(plugins as PostcssPlugin[]).process(
              css,
              processOptions,
            )).css;

            // Create element id from the filename
            let id = createElementId(file.path);
            if (elementIds.has(id)) {
              // This _should_ be guaranteed to be unique because it's the only
              // place we're suffixing a double underscore.
              id = `${id}__${elementIds.size}`;
            }
            elementIds.add(id);

            styles.push({
              cssText,
              id,
            });
          }
        }
      }

      return {
        styles,
        scripts: [],
      };
    },
  };
}
export { freshPostcss };
