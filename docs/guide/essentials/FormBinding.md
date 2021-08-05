# Form binding

Bits allows you to create two-way data binding to input, textarea and select elements. Based on the element type
it will automatically choose the correct way to read and write the value of your input element.

To create a two-way binding you use the `data-model` attribute that has the name of the reactive property of your bit as value.

## Example 

This example shows all possible binding types in a single form:

<Example href="/demo/examples/essentials-form-binding.html" :height="500"/>

## Basic usage

Let's start with a simple bit implementation in your javascript:

```typescript
import {AbstractBit, Data} from '@labor-digital/bits';
export class Example extends AbstractBit
{
    @Data()
    value: string = '';
}
```

And a equally simple html template for it 
```html
<b-mount type="example">
    <input type="text" data-model="value" placeholder="Type something">
    <span data-bind="value"></span>
</b-mount>
```

Which will result in a functionality like this:

<Example href="/demo/examples/essentials-form-binding-basic.html" :height="170"/>

## Initial data pulling

Contrary to most other frameworks this library expects server side rendered HTML,
meaning your form-engine will probably insert values in input fields. So, it makes
sense that the frontend js should actively PULL the value from a data binding into it's model,
instead of providing the data to the element.

Every property you bind using `data-model` which has NULL as value, will be assumed to be pullable from your HTML.
To see this in action, we slightly modify the code from above: 

```typescript
import {AbstractBit, Data} from '@labor-digital/bits';
export class Example extends AbstractBit
{
    @Data()
    value: string|null = null;
}
```

```html
<b-mount type="example">
    <input type="text" data-model="value" value="Initial value" placeholder="Type something">
    <span data-bind="value"></span>
</b-mount>
```

As you can see, we used NULL as an initial value and defined a `value` attribute on our input field.
With those two changes in place, the value will be automatically "pulled" into the property:

<Example href="/demo/examples/essentials-form-binding-basic-pulling.html" :height="170"/>

::: tip Extended example

This works on all form input types, to see the complete form example above, with data pulling click <a href="/demo/examples/forms-pulling.html" target="_blank">here</a>.

:::

::: details ADVANCED EXAMPLE

<Example href="/demo/examples/essentials-form-binding-pulling.html" :height="500"/>

:::

## Field Types

All of those examples assume the following bit source:

```typescript
import {AbstractBit, Data} from '@labor-digital/bits';
export class Example extends AbstractBit
{
    @Data()
    value: any = null;
}
```

### Input (text)
```html
<b-mount type="example">
    <input type="text" data-model="value">
    <span data-bind="value"></span>
</b-mount>
```

<Example href="/demo/examples/essentials-form-binding-type-input-text.html" :height="170"/>

### Input (date)
```html
<b-mount type="example">
    <input type="date" data-model="value">
    <span data-bind="value"></span>
</b-mount>
```

<Example href="/demo/examples/essentials-form-binding-type-input-date.html" :height="170"/>

### Input (radio)
```html
<b-mount type="example">   
    <input type="radio" value="a" data-model="value" id="a">
    <label for="a" class="form-check-label">A</label>
    
    <input type="radio" value="b" data-model="value" id="b">
    <label for="b" class="form-check-label">B</label>
    
    <span data-bind="value"></span>
</b-mount>
```

<Example href="/demo/examples/essentials-form-binding-type-input-radio.html" :height="170"/>

### Input (checkbox)
```html
<b-mount type="example">   
    <input type="checkbox" value="a" data-model="value" id="a">
    <label for="a" class="form-check-label">A</label>
    
    <input type="checkbox" value="b" data-model="value" id="b">
    <label for="b" class="form-check-label">B</label>
    
    <span data-bind="value"></span>
</b-mount>
```

<Example href="/demo/examples/essentials-form-binding-type-input-check.html" :height="190"/>

### Textarea

```html
<b-mount type="example">
    <textarea placeholder="Type something" data-model="value"></textarea>
    <span data-bind="value"></span>
</b-mount>
```

<Example href="/demo/examples/essentials-form-binding-type-textarea.html" :height="190"/>

### Select

```html
<b-mount type="example">
    <select data-model="value">
        <option value="option-a">A</option>
        <option value="option-b">B</option>
        <option value="option-c">C</option>
    </select>
    <span data-bind="value"></span>
</b-mount>
```

<Example href="/demo/examples/essentials-form-binding-type-select.html" :height="170"/>

### Select (multiple)

```html
<b-mount type="example">
    <select data-model="value" multiple>
        <option value="option-a">A</option>
        <option value="option-b">B</option>
        <option value="option-c">C</option>
    </select>
    <span data-bind="value"></span>
</b-mount>
```

<Example href="/demo/examples/essentials-form-binding-type-select-multiple.html" :height="250"/>

## data-model on b-mount elements

Sometimes you want to create your own input elements instead of using the HTML defaults.
Therefore, bits gives you the option to use `data-model` on the `b-mount` element of child-bits. 
To learn more about it, take a look at the [bit interaction section](/guide/advanced/BitInteraction.md).