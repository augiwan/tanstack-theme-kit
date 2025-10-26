import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.tsx"],
  sourcemap: true,
  dts: true,
});
