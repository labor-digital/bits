# Write Plugins

While bits comes with a lot of handy features already built in to its core, you can probably imagine 
cases where you want to extend the basic functionality with your own.
Beginning with version `1.10` you can create plugins to extend the library to your hearts desire.

## Use plugins 

There are some plugins you can install through npm and register them
in your bits application. There are already some pre-made plugins
for everyday problems: 

* [Translator (Multi-Language Bits)](./Translator.md)
* [lit-html (Complex, reactive templates)](./LitHtml.md)
* [Store (App-wide, reactive data store)](./Store.md)

Simply install the plugin through npm and add it to your app configuration, for example:

```
npm install @labor-digital/bits-translator
```

```typescript
import {BitApp} from '@labor-digital/bits';
import TranslatorPlugin from '@labor-digital/bits-translator';

new BitApp({
    /* ... */
    plugins: [
        new TranslatorPlugin()
    ]
});
```

::: tip

A plugin is only active in the application you have registered it for.
Should you have multiple bit apps, you can have completely different
plugins and/or configurations.

:::

## Create a plugin

To create a new plugin, start with a new typescript file that will
contain the main class. In our case we call it `DemoPlugin.ts` that
has the following content:

```typescript
import {IBitPlugin} from '@labor-digital/bits';

export class DemoPlugin implements IBitPlugin
{

}
```

That is the basic implementation required to make a plugin, now you have
to register it in your app in the plugins section of the app config.

```typescript
import {BitApp} from '@labor-digital/bits';
import DemoPlugin from './DemoPlugin';

new BitApp({
    /* ... */
    plugins: [
        new DemoPlugin()
    ]
});
```

So, while we created a plugin, we don't have much benefit yet. So let's start to
extend our plugin class with the hook methods. The plugin has three lifecycle hooks to inject itself into the application.

### initialized

Executed right after the plugin instance was initialized. This means,
the plugin loader noticed the registered plugin instance for the first time.
This is normally done right before the ["created" lifecycle hook](../essentials/Lifecycle.md#created-2)

::: tip

This hook is the best place to register custom services into the service container.

```typescript
import {BitApp, IBitPlugin} from '@labor-digital/bits';
import {PluginService} from './PluginService';

export class DemoPlugin implements IBitPlugin
{
    public initialized(app: BitApp): void
    {
        // Either as instance that must be available at all times
        app.di.set('pluginService', new PluginService());
        // Or as factory to be created only when required
        app.di.setFactory('pluginService', () => new PluginService());
    }
}
```
:::

### created

Executed when the bits app reaches the ["created" lifecycle hook](../essentials/Lifecycle.md#created-2), before the DOM gets mounted.

### mounted

Executed when the bits app reaches the ["mounted" lifecycle hook](../essentials/Lifecycle.md#mounted-2), after the bits have been mounted to the DOM

## Extending the bits

Your plugin can extend extending bits by injecting methods, or a getters to all 
bit instances of the app, using the `extendBits()` method. The class extension is not done
through the prototype, which allows for different extensions in different apps.

`extendBits()` receives the `inject()` function as property to register extensions with.
If you ever worked with [nuxt](https://nuxtjs.org/docs/2.x/directory-structure/plugins#inject-in-root--context) you will probably
know what's coming next ;).

```typescript
import {IBitPluginExtensionInjector,AbstractBit, IBitPlugin} from '@labor-digital/bits';

export class DemoPlugin implements IBitPlugin
{
    public extendBits(inject: IBitPluginExtensionInjector): void
    {
        // The first parameter defines the name of the method
        // to be added to the bit classes, the second parameter
        // defines the function to be executed when the method is called.
        // As you can see, the methods this always points to the bit it is 
        // executed in.
        
        // We use the plugin service we injected in the "initialized" lifecycle hook
        // example further up on this page.
        inject('changePluginMessage', function (this: AbstractBit, message: string) {
            this.$di.pluginService.message = message;
        });
        
        // Instead of a function, you can also provide an object literal containing
        // additional options as second parameter. With this we tell inject, that it 
        // should handle our callback like a getter.
        inject('pluginService', {
            callback: function (this: AbstractBit) {
                return this.$di.pluginService;
            },
            getter: true
        });
    }
}
```

::: tip

When you use inject, make sure to start your function parameters with `(this: AbstractBit)`.
This tells typescript, that the function is actually part of the bit class, and you can access protected properties without issues.

::: 

After you registered the extensions, you can now use them in your bit.
You can see how it works in the bit we registered from our plugin.

```typescript
import {AbstractBit, Hot, Listener} from '@labor-digital/bits';

@Hot(module)
export class PluginBit extends AbstractBit
{
    @Listener('click')
    protected onClick(): void
    {
        this.$changePluginMessage('I was clicked!');
    }
    
    public get message(): string
    {
        return this.$pluginService.message;
    }
}
```

::: tip

The `$` prefix is a declaration I inherited from vue to prefix everything
not part of the current bit class. It is automatically prepended to every extension
registered through `inject()`

:::

::: details Plugin Service

This is the source code of our plugin service, we registered in the "initialized" lifecycle hook example further up on this page.
Nothing much to talk about, other than the usage of `makeObservable()` to create a reactive service property.

```typescript
import {makeObservable, observable} from 'mobx';

export class PluginService
{
    protected _message: string = 'Hello world! I am a demo plugin :)';
    
    constructor()
    {
        makeObservable(this, {_message: observable} as any);
    }
    
    public set message(message)
    {
        this._message = message;
    }
    
    public get message(): string
    {
        return this._message;
    }
}
```

:::

### Typescript and Autocompletion

While technically already working, typescript and your autocompletion will likely complain about
not knowing our extension being part of the bit class.

```
TS2339: Property '$changePluginMessage' does not exist on type 'PluginBit'.
TS2339: Property '$pluginService' does not exist on type 'PluginBit'.
```

To fix this issue we use module augmentation to tell typescript about our extension.
At the top of the plugin class we will add the following:

```typescript
declare module '@labor-digital/bits/dist/Core/AbstractBit'
{
    interface AbstractBit
    {
        $changePluginMessage(message: string): void;
        readonly $pluginService: PluginService;
    }
}

declare module '@labor-digital/bits/dist/Core/Di/DiContainer'
{
    interface DiContainer
    {
        readonly pluginService: PluginService
    }
}
```

And there you have it, now typescript compiles the code without an issue.

## Providing bits

Your plugin can provide bit classes to the application, which is really helpful to encapsulate reusable code,
for sliders, modals and similar elements. The `provideBits` method in your plugin class allows you
to return a bit definition you already know from the app options.

```typescript
import {BitApp, IBitNs, IBitPlugin} from '@labor-digital/bits';
import {PluginBit} from './PluginBit';

export class DemoPlugin implements IBitPlugin
{
    /* ... */
    
    public provideBits(app: BitApp): IBitNs
    {
        return {
            plugin: {
                demo: PluginBit
            }
        };
    }
    
}
```

Now you can add this markup to your page and see how the bit
provided by the plugin is automatically registered for usage:

```html
<b-mount type="plugin/demo"><span data-bind="message"></span></b-mount>
```

<Example href="/demo/examples/plugin-example.html" :height="100"/>

::: tip

Like in the app bit definition you can nest the definition using object literals,
the resulting type will be "plugin/demo". I would strongly suggest to use a common "namespace"
for all your provided bits, to avoid naming collisions.

:::

::: tip PRO-TIP

Plugin bits are registered before those of the app, this allows you to
override plugin bits on a per-app basis.

:::