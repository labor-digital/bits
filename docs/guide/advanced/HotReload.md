# Hot Reload

If your module bundler supports hot reloading / hot module replacement (hmr), bits are ready for the task, too.

Hmr means, that when you edit the javascript source code of a bit, the instance on the site will be destroyed and recreated
without reloading the entire page. This makes developing and testing your javascript code a lot faster.

![Hot module replacement demo](/hmr_bits.gif)

## No state preservation
In a framework like vue, where everything you do runs through a "renderer" state preservation is fairly easy to achieve,
bits are working with the DOM directly, therefore there is no clear indicator on how the current state affects the DOM and vice verca.
Therefore, when a bit is hot reloaded the current state will be dropped and reverted, back to the original.

This also means, that the HTML markdown of the bit mount will be reverted to the initial HTML state. This means all child-bits are recreated as well,
so you can start with a blank state after the update.

## Usage 

To use hot reload you must enable it on a per-bit level. To do this, simply use the `@Hot` decorator on your bit class:

```typescript
import {AbstractBit, Hot} from './AbstractBit';

@Hot(module)
export class ExampleBit extends AbstractBit{
    // ... your code here
}
```

::: tip What's module doing in there?

Yes, "module" is a global variable that gets provided by your module bundler (like webpack) and that bits uses to detect hot updates on a class.
**It is crucial, that you provide the module variable to @Hot, otherwise it will not work**

:::

