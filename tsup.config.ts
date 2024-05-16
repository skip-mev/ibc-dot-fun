import type { Options } from "tsup";
import { defineConfig } from "tsup";

export default defineConfig(({ watch }) => [
  {
    cjsInterop: true,
    clean: true,
    format: ["cjs", "esm"],
    shims: true,
    splitting: true,
    treeshake: true,
    dts: true,
    entry: ["src/widget/index.ts"],
    minify: !watch,
  },
]);
