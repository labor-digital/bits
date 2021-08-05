# Lit Html

While bits has the dedicated scope of working with server rendered HTML, and provides some
basic JS templating functionality, you might want to get a bit more sophisticated. 

For this I trust in the standalone templating engine [lit-html](https://lit.dev/docs/libraries/standalone-templates/) 
which is part of the [lit web component framework](https://lit.dev/).

This plugin offers smooth integration into the bits ecosystem with reactive re-rendering
and two-way data binding.

## Installation

::: tip

Until the next major release, the translator is [part of the core distribution](../advanced/Translations.md).
So, you can install it as a plugin to be ready for a v2 update, but don't need to, yet.

:::

Install the plugin through npm:

```
npm install @labor-digital/bits-lit-html
```

Register it in your plugin section:

```typescript
import {BitApp} from '@labor-digital/bits';
import {LitHtmlPlugin} from '@labor-digital/bits-lit-html';

new BitApp({
    bits: { /* ... */},
    plugins: [
        new LitHtmlPlugin()
    ]
});
```

## $html()

The `$html()` method is available in any bit, which provides data- and listener binding, 
as well as conditional- and list rendering.

### Basic usage
When you work with `$html()` you have two options:
1. If you provide a "mount" inside your DOM tree, the rendered HTML will be injected into it automatically.
2. If no "mount" was defined, the rendered HTML will replace the HTML inside your `b-mount` node instead.

So, let's start with a basic HTML markup:

```html
<b-mount type="html"></b-mount>
```

And a matching bit definition:
```typescript
import {AbstractBit, html} from '@labor-digital/bits';

export class Html extends AbstractBit
{
    public mounted()
    {
        this.$html(() => html`<span>I'm a <strong>bold</strong> claim!</span>`);
    }
}
```

This will add the `<span>I'm a <strong>bold</strong> claim!</span>` as content of the `b-mount` tag, because no mount element was specified.

<Example href="/demo/examples/plugin-lit-html.html" :height="90"/>

Please note two things: Firstly, the HTML string is wrapped in es6 template literals, that gets preceded by `html`, which is a function provided by the [lit-element template syntax](https://lit-html.polymer-project.org/guide/template-reference). **This is important! It won't work without it!**
Secondly, note how we don't provide our template as a string to `$html` but instead, wrapped in a fat arrow function. This is needed so that the template can get re-rendered automatically when your
data changed.

::: tip Providing a mount point

A mount point can be any element in your bit, (theoretically even outside your bit, if you provide a DOM node manually).

```html
<b-mount type="html">
    <h1>Fancy Headline</h1>
    <p>Some fancy text <span data-ref="htmlMount"></span></p>
</b-mount>
```

To specify a mount point, simply set it as first argument for "html":
```typescript
this.$html('@htmlMount', () => html`I'm a <strong>bold</strong> claim!`);
```

:::

### Data and listener binding

Before you go on, I would urge you to read (or at least skim over) [the lit-html template reference](https://lit-html.polymer-project.org/guide/template-reference),
to get a basic understanding on how it works. Bits only adds the reactivity-glue-layer on top of it, so everything I could tell you is already written there.

Talking about reactivity, here is how you bind data, and a simple click listener to the html generated using `$html`.
While the html markup stays the same as in the example above, we modify the bit code to look like this:

```typescript
import {AbstractBit, Data, html} from '@labor-digital/bits';

export class Html extends AbstractBit
{
    @Data()
    protected count: number = 0;
    
    protected onClick(): void
    {
        this.count++;
    }
    
    public mounted()
    {
        this.$html(() => html`
            <div>
                <button @click="${this.onClick}">Click me</button>
                <strong>${this.count}</strong>
            </div>`);
    }
}
```

This is basic lit-html markup and nothing to be afraid about. The `@click` attribute will add the "onClick" method, as a listener for the mouse "click" event.
`this.count` is used to render a value in your template. Because `$html()` will automatically watch all properties used to generate the output,
you can simply modify the count and expect your HTML to be updated for you:

<Example href="/demo/examples/plugin-lit-html-binding.html" :height="100"/>

### Two-way binding (data-model)
Sadly, two-way data binding is not really intuitive in lit-html
Therefore this library provides an additional glue layer in form of the "dataModel" directive, to ease the pain a bit. It is not perfect, but the best I can currently provide.

To get it wo work, you define the input event to listen for (change/keyup for the most part),
like any other event listener and then, tell the directive which property you want to bind it to.
The binding will automatically update the input value in the same way data-model would.

```typescript
import {AbstractBit, Data, dataModel, html} from '@labor-digital/bits';

export class HtmlModel extends AbstractBit
{
    @Data()
    protected value: string = '';
    
    public mounted()
    {
        this.$html(() => html`
            <div>
                <input type="text" @keyup="${dataModel('value')}" placeholder="Type something"/>
                <strong>${this.value}</strong>
            </div>`
        );
    }
}
```

<Example href="/demo/examples/plugin-lit-html-model.html" :height="170"/>

### Extended example

You can find an extended example using all the described functionality [in the gitHub repo](https://github.com/labor-digital/bits/blob/master/demo/src/Bits/HtmlBit.ts).
Which will look somewhat like this:

<Example href="/demo/examples/plugin-lit-html-advanced.html" :height="500"/>
