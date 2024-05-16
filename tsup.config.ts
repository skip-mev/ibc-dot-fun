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
    inject: ["./react-shim.js"],
    external: ["wagmi", "viem", "@solana/*", "@cosmos-kit/*", "@cosmjs/*", "react", "react-dom"],
    minify: !watch,
  },
]);
