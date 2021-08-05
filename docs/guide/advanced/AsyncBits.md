# Async Bits

Normally you register the bit classes using the ["bits" option when](https://bits.labor.tools/guide/#create-the-app) the bit app gets created. However,
if your build setup supports code splitting through dynamic imports (e.g. [webpack](https://webpack.js.org/guides/code-splitting/)), you can also split off large
or less frequently used bit classes into their own chunks.

When your build setup is configured to support this feature, you can use the `bitResolver` option to provide a 
callback that resolves types asynchronously. 

```typescript
import {BitApp} from '@labor-digital/bits';

new BitApp({
    bits: { /* Optional other bit definitions */ },
    
    bitResolver: type => {
        return import('./Bits/Async/' + ucFirst(type));
    },
});
```

The resolver receives the type, as it was provided in the "type" attribute of the mount and should use it to create a dynamic request through `import()`.
This will return a promise which, when resolved must contain the bit instance to be used. 

As a basic example, with a mount point like this: 

```html
<b-mount type="async">
    <div>Loading...</div>
</b-mount>
```

And a small bit like this you can see how the "Loading..." is used as placeholder until the bit is resolved and takes over: 

```typescript
import {AbstractBit} from '@labor-digital/bits';

export class Example extends AbstractBit
{
    public mounted()
    {
        this.$el.innerHtml = 'I am loaded now!';
    }
}
```

<Example href="/demo/examples/advanced-async.html" :height="90"/>
