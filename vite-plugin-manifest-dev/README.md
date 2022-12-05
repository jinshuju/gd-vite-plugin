create enter list file for backend use

## Usage

```typescript
export type vitePluginIgnoreType = {
  // a path to get entry
  assets: Record<string, string>;
  // output path
  output: string;
  // other config to enter list
  extraConfig?: Record<string, string>;
};
```

## Example

```typescript

import vitePluginManifestDev from '@gd-uikit/vite-plugin-manifest-dev'
import Paths form 'mock-path.json'
import { resolve } from 'path'

// vite.config.ts;
return defineConfig({
  plugins: [
    vitePluginManifestDev({
      assets: Paths,
      output: resolve(__dirname, './manifest'),
      extraConfig: {testConfigName:'name',testConfigAge:'age'},
    }),
  ],
});

//mock-path.json
{
  "index": "src/index",
  "order": "src/pages/order/index",
}

// output path
{
  "entrypoints": {
    "index": {
      "assets": {
        "js": [
          "src/index"
        ]
      }
    },
  },
  "testConfigName":'name',
  "testConfigAge":'age'
}


```
