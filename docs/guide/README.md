---
sidebarDepth: 1
---

# Getting started

If you are not the reading kind of person, there is also a working list of examples, including a webpack setup in the [demo directory](https://github.com/labor-digital/bits/tree/master/demo)

::: tip 

The frontend framework of my choice is vue.js, therefore you should not be surprised to find similarities in naming and design choices :D

:::

## Installation and project setup
Start by adding the bits library using npm:

```
npm install @labor-digital/bits
```

## Browser support

The library supports all **modern** browsers, that have at least the most basic implementation of web-components. It also has a built-in polyfill for browsers
without the web-component api.

### Internet Explorer

Yes, you can use this library with the IE11, however you need to install some polyfills in you bundle if you want to support it. To install the polyfills you
need to install the following dependencies:

```
npm install @webcomponents/template core-js
```

If you are using webpack you can now add the following elements in your "entry" configuration:

```javascript
module.exports = {
    entry: [
        '@webcomponents/template/template.js',
        'core-js/features/object/assign',
        'core-js/features/object/is',
        'core-js/features/object/entries',
        'core-js/features/promise',
        'core-js/features/symbol',
        // This is your real entry point. Make sure the polyfills are added before
        // your main entry, otherwise they might not trigger correctly.
        './src/main.ts'
    ]
    // ... Your other webpack config
}
```

If you are not running webpack, simply import those files in your main.ts file

```typescript
import '@webcomponents/template/template.js';
import 'core-js/features/object/assign';
import 'core-js/features/object/is';
import 'core-js/features/object/entries';
import 'core-js/features/promise';
import 'core-js/features/symbol';
// Your other imports and code should be below those lines
```

## Structure (Suggestion)

Let's say your project looks something like this:

```
    | package.json
    | webpack.config.js
    | index.html 
    | dist <- Webpack dumps into this directory
    | main.ts <- This is your main entry point
    | src <- This is the directory where all your code goes
```

::: tip

The library does not depend on any folder structure, it is just a suggestion on how to implement your application.

:::

## Typescript

I rely heavily on decorators, which are a [stage 2 proposal](https://github.com/tc39/proposal-decorators) for addition to the ECMAScript standard, which means they’re neither finalized nor implemented in browsers yet.
However, you can configure [typescript](https://www.typescriptlang.org/docs/handbook/decorators.html) to transpile them for you.

To use decorators with TypeScript, enable the experimentalDecorators compiler option. Enabling "emitDecoratorMetadata" is not required, tho.

```json
{
  "compilerOptions": {
	"experimentalDecorators": true
  }
}
```

## Create your first bit

Each bit is represented by a class, that extends the `AbstractBit` class. To do so, create a new typescript file called `src/Bits/HelloBit.ts`.

Inside your file simply add the following:

```typescript
import {AbstractBit} from '@labor-digital/bits';

export class HelloBit extends AbstractBit
{
    
    constructor()
    {
        super();
        
        console.log('Hello world');
    }

}
```

So far, so good, but by its own, this class will do nothing for us. By design each bit is linked with a dom node, so head leads head on over to our index.html
to add a dom node for this bit to link with.

## Adding a mount point

In your `index.html` we need to add a "mount", which is a html element that will be linked with the instance of our bit class. The library uses
the [customElement api](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) to keep track on dom changes and automatically
instantiate a new bit class, every time a mount-point plops into existence, or destroy the bit when the dom node is removed.

::: tip

Unlike the way you normally work with custom elements, you won't define custom-tags for each of your bits. This has, two major reasons: 1. it is easer to
polyfill for older browsers like ie and 2. it allows some nifty features like lazy loading bits using webpacks dynamic import()

:::

Adding a mount is simple, just add the following code to your `<body>` tag:

```html
<b-mount type="hello"></b-mount>
```

The "b-mount" tag is a custom-element tag that gets registered by the bits library and defines a mount point for a single bit. Please keep in mind the "type"
attribute is **required** for a b-mount tag. If you don't set it, the script will throw an error.

## Create the app

The final step is, to create an "app" that will orchestrate all your created bits and serves as a connection point between all bit instances on the page.

For that open up your `main.ts` file and add the following code:

```typescript
import {BitApp} from '@labor-digital/bits';
import {HelloBit} from './src/Bits/HelloBit'

new BitApp({
    bits: {
        hello: HelloBit
    }
});
```

::: tip

You can find the list of all supported options [here](/api/interfaces/ibitappoptions.md)

:::

The app is a central registry for all bits of your project, and acts as map between the "type" attribute on the b-mount tag and your actual class. It will also
provide a global event bus to all your bits to allow cross-bit events independent of the dom.

With that you are done, if you build the code and run it in your browser, you will see "Hello world" in your console.

## Don't go solo, take a wookee!

Now, that we have our first bit that says hello to the world, let's create give it a friend. Open up your `index.html` and duplicate that mount tag:

```html
<b-mount type="hello"></b-mount>
<b-mount type="hello"></b-mount>
```

When you reload the page in your browser, you will now see "Hello world" two times, displayed in your console. This is, because exactly like a component in one
of the major frameworks a single bit instance is bound to a single mount. That way you don't have to think much about how components of the same type interact
with each other.

Which brings you to the next chapter, the lifecycle of a bit: [lifecycle hooks](./essentials/Lifecycle.md)
