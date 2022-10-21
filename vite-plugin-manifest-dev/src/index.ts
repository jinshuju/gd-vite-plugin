import * as fs from "fs";
import path from "path";

import type { PluginOption } from "vite";

export default function vitePluginManifestDev({
  assets,
  output,
  extraConfig = {},
}: {
  assets: Record<string, string>;
  output: string;
  extraConfig?: Record<string, string>;
}): PluginOption {
  return {
    name: "vite-plugin-manifest-dev",
    buildStart() {
      if (!fs.existsSync(output)) {
        fs.mkdirSync(path.dirname(output), { recursive: true });
      }

      const entrypoints: Record<string, any> = {};

      for (const name in assets) {
        const entrypoint = assets[name];
        entrypoints[name] = {
          assets: {
            js: [entrypoint],
          },
        };
      }

      fs.writeFileSync(
        output,
        JSON.stringify({ entrypoints, ...extraConfig }, null, 2)
      );
    },
    buildEnd() {
      fs.rmdirSync(output);
      fs.unlinkSync(path.dirname(output));
    },
  };
}
