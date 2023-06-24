import { expandGlob } from "https://deno.land/std@0.192.0/fs/expand_glob.ts";
import {
  type Plugin as FreshPlugin,
} from "https://deno.land/x/fresh@1.2.0/server.ts";
import postcss, {
  type AcceptedPlugin as PostcssPlugin,
  type ProcessOptions,
} from "https://esm.sh/postcss@8.4.24";

export { expandGlob, postcss };
export type { FreshPlugin, PostcssPlugin, ProcessOptions };
