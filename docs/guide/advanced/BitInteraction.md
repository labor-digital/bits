# Bit interaction
By design, everything that is part of a bit instance, stays inside this specific instance.
There should be no leakage of data and pollution through out-of-scope HTML lookups. But what if you WANT to
pass data from one bit to another. Of course, you already learned about events, or could use the [event bus](http://localhost:8080/guide/EventsAndProxy.html#event-bus),
but that's not really convenient, is it?

So bits provides multiple mechanisms of working with data cross-instance.

## Context
Context is a word I borrowed from "react", vue.js calls it "provide/inject", it basically means that a parent component,
provides some kind of data to all of its nested children. Bits allows you to do the same.

Imagine a simple implementation of a "parent" that looks like this:
```typescript
import {AbstractBit, Data} from '@labor-digital/bits';

export class Parent extends AbstractBit
{
    @Data()
    text: string = 'Parent text';
}
```

Combine it with a super simple "child" that does nothing on its own:
```typescript
import {AbstractBit, Data} from '@labor-digital/bits';

export class Child extends AbstractBit {}
```

If you now take a look at the following HTML markup, you will see, that the "parent"
has a attribute called "context". This attribute tells the bits, that it provides the bit data to all nested children.
Every child can therefore call `data-bind` on the context with the given name. 

To bind a context value instead of a local property, use the magic "@" prefix, the name of the context
and then the property name you want to bind. 

```html
<b-mount type="parent" context="ctx">
    <b-mount type="child">
        <span data-bind="@ctx.text"></span>
    </b-mount>
</b-mount>
```

<Example href="/demo/examples/docs-context.html" :height="90"/>

This will also work for `data-bind-attr`, as well as `data-model`. Take a look at this
advance example ([Parent code](https://github.com/labor-digital/bits/blob/master/demo/src/Bits/Context/Parent.ts), [Child code](https://github.com/labor-digital/bits/blob/master/demo/src/Bits/Context/Child.ts), [HTML](https://github.com/labor-digital/bits/blob/master/demo/examples/context.html)), to see those options in action:

<Example href="/demo/examples/context.html" :height="500"/>

## Props on Bits

While "context" is great to share data between bits while you create templates, you might want not only bind data,
but also react to data in some way inside the child bit. 

This is the part where I write about "props". Props are all over the internets, react has them, vue has them, heck even angular has them now. 
So, bits has them too, just to look cool, and because the concept works well. 

When you say "props" you basically mean one-way attribute-data-binding but for components/bits instead of HTML nodes.
For this reason the binding in your HTML works exactly as any other attribute binding using `data-bind-attr`.

::: tip

You can bind any bit field as prop, as long it is decorated using @Property. 
**@Data() fields CAN NOT be bound as props** because they are considered "protected".

:::

So the implementation is rather simple: 

Parent:
```typescript
import {AbstractBit, Data} from '@labor-digital/bits';
export class Parent extends AbstractBit
{
    @Data()
    prop: string = 'Read me downstairs :D';
}
```

Child:
```typescript
import {AbstractBit, Property} from '@labor-digital/bits';
export class Child extends AbstractBit
{
    // This MUST be @Property!
    @Property()
    value: string = '';
}
```

HTML:
```html
<b-mount type="parent">
    <b-mount type="child" data-bind-attr="value:prop">
        <span data-bind="value"></span>
    </b-mount>
</b-mount>
```

<Example href="/demo/examples/docs-props.html" :height="90"/>


## Model on Bits

While props only go one way, you can also create a two-way data binding between two props.
The setup is exactly the same as in the prop example above, but with a slightly modified HTML:

```html
<b-mount type="parent">
    <b-mount type="child" data-model="prop">
        <input type="text" data-model="value">
    </b-mount>
    <div data-bind="prop"></div>
</b-mount>
```

::: warning "value" special field

The model on bits will currently **always** bind itself to a property/field called **"value"**. 
If this property is not present on the bit you try to bind to, an error will be thrown.

:::

<Example href="/demo/examples/docs-model.html" :height="190"/>

### Programmatic updates
If you don't want to just bind the value to a dom node in the child, you can also set the value property programmatically.
This allows you to create custom form elements that automatically update the parent and propagate changes.

Parent:
```typescript
import {AbstractBit, Data} from '@labor-digital/bits';
export class Parent extends AbstractBit
{
    @Data()
    prop: string = '';
}
```

Child:
```typescript
import {AbstractBit, Property} from '@labor-digital/bits';
export class Child extends AbstractBit
{
    @Property()
    value: string = '';
    
    @Listener('click', '@button')
    onClick(){
        this.value = 'My value';
    }
}
```

HTML:
```html
<b-mount type="parent">
    <span data-bind="model"></span>
    
    <b-mount type="child" data-model="model">
        <button data-ref="button">Click me</button>
    </b-mount>
</b-mount>
```

<Example href="/demo/examples/props-programmatic.html" :height="300"/>

## Props & Model extended example:

This is an extended example, that puts both props and models in a comparable example.

<Example href="/demo/examples/props.html" :height="600"/>
