# Reactivity & DOM binding

The main benefit of working with bits is the interaction between your data and the DOM. 
While mostly designed for server side rendered HTML your data inside of bits will probably not 
reach the extent it does in your angular/vue/react application; however reacting to
user inputs or state changes without worrying about the output will help you a lot in your daily work.

## State management

Under the hood bits uses [mobx](https://mobx.js.org/) to handle the state management inside your bit. It is a battle tested library
that does most of the heavy lifting for us. 

## Data

Every property inside your bit class can be made reactive using the `Data` decorator. 
It will tell the bit app, that it should actively watch this property for any changes. 
```typescript
import {AbstractBit, Data} from '@labor-digital/bits';

export class Reactivity extends AbstractBit {
    
    @Data()
    protected counter: number = 0;
}
```

## Bind data to DOM elements

Without any way to output reactive data is quite boring, isn't it. So we have to create some kind of DOM node
that will show the content of our "counter" variable for us. 

```html
<b-mount type="reactivity">
    <div data-bind="counter"></div>
</b-mount>
```

With `data-bind` you can tell your bit, that it should bind the value of your "counter" property to the content
of the node. 

<Example href="/demo/examples/essentials-reactivity.html" :height="100"/>

Okay, as you see, the "0" we set as a default for our counter is now shown in your node, but what now?

## Properties

We could extend our "Data" out to the attribute of the HTML node that represents our bit.
With this we could allow the HTML to define the initial value of our counter. 

We can do this by replacing the `Data()` decorator with the `Property()` decorator instead. 

```typescript
import {AbstractBit, Property} from '@labor-digital/bits';

export class Reactivity extends AbstractBit {
    
    @Property({type: Number})
    protected counter: number = 0;
}
```

Please note that, for numeric values you have to tell the script that it should cast the value as a number for you.
You can do this by providing "Number" as type configuration. For more advanced conversions you could also define a converter function,
to serialize/unserialize the data for the html attribute.

With that in place you can set the initial value of "counter" through the "counter" attribute on your `b-mount`

```html
<b-mount type="reactivity" counter="10">
    <div data-bind="counter"></div>
</b-mount>
```

Please note, that we set the attribute directly on the `b-mount` tag. If you run the script now, you see that the value starts with 10 instead of 0.

<Example href="/demo/examples/essentials-reactivity-property.html" :height="100"/>


## Bind event listeners

Next we want to somehow trigger an update on our counter to see how the reactivity works.
To make this, we could set a timeout or interval, but instead, lets create a button,
that listens to a click and then counts our counter up by one. 

First we adjust our HTML a bit, to add our button

```html
<b-mount type="reactivity">
    <div data-bind="counter"></div>
    <button id="counter-button">Count up!</button>
</b-mount>
```

Next, we will add a new method to our bit that handles the click on the button

```typescript
import {AbstractBit, Property, Listener} from '@labor-digital/bits';

export class Reactivity extends AbstractBit {
    
    @Property({type: Number})
    protected counter: number = 0;
    
    @Listener('click', '#counter-button')
    protected onClick(): void{
        this.counter++;
    }
}
```

With the `Listener` decorator you can bind a method in your bit as an event listener.
The first argument is the type of event you want to listen to. This is any valid javascript event, including custom events.
As a second argument, you can provide the "target" on which the listener should be bound. This can be a css-selector, a callback that returns a DOM element, or a "ref" selector.
If you omit the "target", the listener will be bound to the `b-mount` node.

::: tip

You can also bind a listener to multiple elements at once, by using a selector that resolves to
multiple nodes instead.

:::

Inside our event handler we simply increase the value by one every time it is executed.
And with that, it just works ;)

<Example href="/demo/examples/essentials-reactivity-button.html" :height="150"/>

## Bind data to DOM attributes

In the "properties" section you learned that you can read the content of attributes on the `b-mount` to read
values, but what about setting the attributes of a DOM node? 

You can do that to, instead of "data-bind" we now use the "data-bind-attr" attribute to tell your bit, which property
it should bind to which attribute on your node.

```html
<b-mount type="reactivity">
    <div data-bind="counter" data-bind-attr="title:counter"></div>
    <button id="counter-button">Count up!</button>
</b-mount>
```

We create a binding between the "title" attribute and your "counter" property. Now, when you hover over your counter output, you will see the number in the tooltip as well.

<Example href="/demo/examples/essentials-reactivity-bind-attr.html" :height="150"/>

::: tip

You can bind multiple attributes to properties, by separating the maps by a comma.
This would look like: data-bind-attr="title:counter,aria-label:labelProperty"

::: 

::: warning

You can't add attribute binding to the containing `b-mount` tag! You can add attribute binding
to child `b-mount` tags, tho! Read more about this in the [props section](/guide/BitInteraction.md#props-on-bits).

:::

## Computed properties

While our "numeric title" is nice and all, let's say we want something more speaking as a title.
To do so, we will create a "computed" property. It is reactive like a normal property would be, but 
also runs a function before it is returned; which will allow us to add some text in front of our counter number.

As an additional benefit the "filter" is only executed once, the value is then cached and re-used until
the data used to generate it has changed. 

To create a computed property we use the [es6 getter syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get).
Bits will automatically detect this as a computed property and configure mobx automatically.

```typescript
import {AbstractBit, Property, Listener} from '@labor-digital/bits';

export class Reactivity extends AbstractBit {
    
    @Property({type: Number})
    protected counter: number = 0;
    
    protected get title(): string
    {
        return 'The counter value is currently: ' + this.counter;
    }
    
    @Listener('click', '#counter-button')
    protected onClick(): void{
        this.counter++;
    }
}
```

Now, we simply point the attribute binding from "counter" to our "title" property. If you hover above the data-binding now,
you will see how it says: 'The counter value is currently: 10' instead.

```html
<b-mount type="reactivity">
    <div data-bind="counter" data-bind-attr="title:title"></div>
    <button id="counter-button">Count up!</button>
</b-mount>
```

<Example href="/demo/examples/essentials-reactivity-computed.html" :height="150"/>

## Summary

To sum this chapter up, here is a slightly different example, that shows how you can go further.

<Example href="/demo/examples/essentials-reactivity-alternative.html" :height="165"/>

The example uses the following code:

```typescript
import {AbstractBit, Data, Listener} from '@labor-digital/bits';

export class ReactivityAlternative extends AbstractBit
{
    @Data()
    counter: number = 0;
    
    @Data()
    text: string = '';
    
    @Listener('click', '#add-button')
    protected onAdd()
    {
        this.text += (this.text.length > 0 ? ',' : '') + this.counter++;
    }
    
    @Listener('click', '#clear-button')
    protected onClear()
    {
        this.text = '';
        this.counter = 0;
    }
}
```

```html
<b-mount type="reactivity/alternative">
    <div data-bind-attr="title:text">
        <div>
            <button id="add-button">Add number</button>
            <button id="clear-button">Clear</button>
        </div>
    
        Output: <strong data-bind="text"></strong>
    </div>
</b-mount>
```