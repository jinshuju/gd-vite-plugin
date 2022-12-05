transform require url to new URL

## example

```typescript
   require(`./xxx`) => new URL(`./xxx`, import.meta.url).href
   require("./xxx").default => new URL(`./xxx`, import.meta.url).href
```
