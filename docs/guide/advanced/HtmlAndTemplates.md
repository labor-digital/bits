# HTML and Templates

While the main focus of this library sets on enhancing server side rendered HTML using javascript, sometimes you want to generate HTML to build lists or make a dynamic output. 

For those cases bits provides you with two major options of generating HTML/manipulating the dom.

## $html()

::: danger LEGACY

Until the next major release the $html, $styleMap and $classMap methods are provided as a core feature,
after that you need to install it as a [separate plugin](../plugins/LitHtml.md)

:::

The `$html()` method is available in any bit and acts as a wrapper around [lit-html](https://lit-html.polymer-project.org/), which allows dynamic re-rendering when used, reactive data was modified.
lit-html provides data- and listener binding, as well as conditional- and list rendering.

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

## $tpl()

Where `$html` is your swiss army knife of generating HTML, `$tpl` is basically the little toothpick on the side. 
It does no real template rendering itself, but loads the content of a "template" tag into a new sub-node which will be returned by it.

To be selectable, your template should have a data-ref="$ref" attribute. The method allows you to provide a one-dimensional list of values that should be injected
while the template is loaded. NOTE: This is not reactive, but merely an initial state.

To define a marker add the data-value="key" attribute to any child of your template tag,
and provide the data like {key: 'my-value'}. All data is injected as text and therefore auto-escaped.

::: tip

If your template contains binding attributes like data-bind or data-model, you have to execute
the $domChanged() method once, after the node was attached to the dom tree! This will tell the library that 
those new elements must be bound to their respective instances

:::

::: warning ADVICE

For advanced templating tasks I would strongly advise you, to use $html() instead, as it is reactive
to any data changes and allows special features like event-listeners.

:::

For an example, start with a HTML like this:
```html
<b-mount type="templates" class="card bg-light mt-3">
    <template data-ref="tpl">
        <li class="list-group-item">
            I am <span data-value="id"></span>
            <button data-ref="remove">Remove</button>
        </li>
    </template>
    
    <button data-ref="add">Add Line</button>
    
    <ul data-ref="elements" >
        <li >You can add new sections here</li>
    </ul>
</b-mount>
```

Your script could look somewhat like this:

::: tip

There are two functions from an external library you can ignore:

closest() is a legacy wrapper for HTMLElement.closest() which is not supported in IE11.
getGuid() returns a unique id with the given prefix. 

:::

```typescript
import {AbstractBit, Listener} from '@labor-digital/bits';
import {closest, getGuid} from '@labor-digital/helferlein';

export class Templates extends AbstractBit
{
    @Listener('click', '@remove')
    onRemoveClick(e: MouseEvent)
    {
        const el = closest('li', e.target as HTMLElement);
        el?.parentElement!.removeChild(el);
    }
    
    @Listener('click', '@add')
    onAddChild()
    {
        this.$find('@elements')!.appendChild(
            this.$tpl('tpl', {
                id: getGuid('entry ')
            })
        );
        
        this.$domChanged();
    }
}
```

<Example href="/demo/examples/advanced-templates.html" :height="250"/>

::: tip $domChanged()

Now, because we changed the dom in a way that can not be tracked by the system,
we manually have to tell it, that it should rebind all static event listeners (@Listener annotation) and all
one- and two-way data bindings for us. This can be done easily, by executing the $domChanged() method.
NOTE: Please don't overuse this feature, or you might see performance drops!

**Pro tip:** Under the hood a "domChange" event will bubble up the dom tree and will also
update all other bit mounts it meets along the way. This means that all your parent
nodes will also rebind their data.

**Super-Pro tip:** You can listen for a "domChange" either using a event listener with this.$on('domChange'),
or by using the domChanged() lifecycle hook

:::