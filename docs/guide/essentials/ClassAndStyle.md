# Class and style bindings

A common use case for [reactive data binding](./Reactivity.md) is to set or remove CSS classes, and
define inline styles on specific node elements.

To resolve this need, bits provides some black magic when you create an [attribute binding](./Reactivity.md#bind-data-to-dom-attributes)
for either `style` or `class`. 

<Example href="/demo/examples/essentials-style-and-classes.html" :height="170"/>

## Binding HTML classes

You can bind either a string, or an object literal to the "class" property. The object variant allows you
to dynamically toggle classes. 

The object containing the classes, can either be "data", a "property" or even a "computed property".

Let's imagine this simple example, where we have a flag "isActive", and a computed property "classes",
that provides an object containing both classes, and their matching "toggle state". 

The key of the object is the "class", that will be added, while the value determines by its [truthiness](https://developer.mozilla.org/en-US/docs/Glossary/Truthy) if the class should be added or removed.

```typescript
import {AbstractBit, Data} from '@labor-digital/bits';
export class Example extends AbstractBit
{
    @Data()
    isActive: boolean = false;
    
    get classes() {
        return {
            active: this.isActive
        }
    }
    
    @Listener('click', '#toggle-button')
    toggleClass(){
        this.isActive = !this.isActive;
    }
}
```

With the corresponding HTML markup you can toggle the active class:
```html
<b-mount type="example">
    <button id="toggle-button" data-bind-attr="class:classes">Toggle "active" class</button>
</b-mount>
```

You can also have multiple classes toggled by defining more data properties in the bit. 

```typescript
import {AbstractBit, Data} from '@labor-digital/bits';
export class Example extends AbstractBit
{
    @Data()
    isActive: boolean = true;
    
    @Data()
    hasError: boolean = true;
    
    get classes() {
        return {
            active: this.isActive,
            'has-error': this.hasError
        }
    }
    
    // Event listeners are omitted
}
```

This will set the class attribute to `class="active has-error"`, if either of the properties change, the class 
list will automatically be updated to match accordingly.

You can also define "dynamic" classes, based on properties, by using dynamic object keys:

```typescript
import {AbstractBit, Data} from '@labor-digital/bits';
export class Example extends AbstractBit
{
    @Data()
    dynamicClass = 'some-class';
    
    get classes() {
        return {
            [this.dynamicClass]: true
        }
    }
}
```

Which leads to a class list like `class="some-class"`. If you update the dynamicClass property, by setting it to another value, like "another-class"
bits will automatically remove the old class and only set the new one: `class="another-class"`.

## Binding inline styles
The binding of inline style using the object syntax is quite similar to what you do in your
default [javascript style declaration](https://developer.mozilla.org/en-US/docs/Web/API/ElementCSSInlineStyle/style#setting_styles). 

Similar to the HTML class binding, property changes are reactively translated into style changes on the DOM elements.

::: warning

Currently, only camelCase is supported for CSS property names.

::::

```typescript
import {AbstractBit, Data} from '@labor-digital/bits';
export class Example extends AbstractBit
{
    @Data()
    backgroundColor: string = 'green';
    
    @Data()
    fontSize: number = 12;
    
    get styles() {
        return {
            background: this.backgroundColor,
            fontSize: this.fontSize + 'px'
        }
    }
}
```

```html
<b-mount type="example">
    <div data-bind-attr="style:styles"></div>
</b-mount>
```