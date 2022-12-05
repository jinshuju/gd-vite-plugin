Used to ignore components that you do not want to display in Vite

> such as ModuleFederationComponent


## Usage
```typescript

export type vitePluginIgnoreType = {
  //filter files that should enter the plugin
  fileRegex?:  RegExp =  /.tsx$/,
  // ignore component flag words
  label?: string = '@gd-vite-ignore'
};

```

### case 1:

```typescript

// @gd-vite-ignore
const ModuleFederationComponent = React.lazy(() => import('components/ModuleFederationComponent'))

render(){
  return <div>
    //  This not render this component
    <ModuleFederationComponent/>

    // This should render this component
    <OtherComponent/>
  </div>
}

```

### case 2:

```typescript

//vite.config.ts
import vitePluginIgnore from '@gd-uikit/vite-plugin-ignore';

plugins: [
  // passing string type Regular expression
  vitePluginIgnore({
    label:'customIgnoreWord'
  }),
],



// @customIgnoreWord
const ModuleFederationComponent = React.lazy(() => import('components/ModuleFederationComponent'))

render(){
  return <div>
    //  This not render this component
    <ModuleFederationComponent/>

    // This should render this component
    <OtherComponent/>
  </div>
}

```
