# Accessing the DOM

In contrast to any frontend framework Bits does not supply you with a lot of options on modifying the DOM. 
Either you use vanilla js, [Dom7](https://www.npmjs.com/package/dom7) or heck, even jQuery if you want to.

When it comes to selecting DOM elements, however, Bits can help you quite a bit (pun intended :P).

## Accessing the mount point
Each bit instance is tied to a DOM element (by default `b-mount`), its mount point. The mount
is considered a hard boundary. This means all operations using $find() will be relative to this element
and will not flow into nested mounts, if not configured specifically to do so.

You have access to the mount of your current instance using `this.$el`. 

## Selecting children using $find()

Inside your bit class you have access to the `$find()` method, that allows you easy access
to all DOM elements inside the scope of your bit. Generally speaking $find() is your "querySelector" on steroids,
which means any css query that works in querySelector, will work with $find, too.

For a simple example imagine this HTML code: 

```html
<b-mount type="example">
    <div id="example-id"></div>
    
    <ul>
        <li class="exampleClass"></li>
        <li class="exampleClass"></li>
    </ul>
    
    <div data-ref="reference"></div>
    <div class="exampleClass"></div>
</b-mount>
```

::: details Bit example code

The bit code will look somewhat like this:

```typescript
import {AbstractBit, Property} from '@labor-digital/bits';
export class Example extends AbstractBit
{
    mounted(){
        // The examples will be here
    }
}
```

:::

Inside the "mounted" lifecycle hook you can start selecting elements using `$find()`, so let's look at some examples.

### Select by id
You can select a single element by its id:
```this.$find('#example-id')```

### Select by css class
You can select a single element by its class name:
```this.$find('.exampleClass')```

**BEWARE:** This will only return the first "LI" in your list, because **$find() will only retrieve a single element**!

::: tip Selecting multiple elements

If you want to find all elements for a given selector (aka. querySelectorAll)
you can use ```this.$findAll('.exampleClass')``` instead :)

**PRO-tip:**
$findAll() will always return an **Array** (yes, an Array not a NodeList!) containing your elements.

:::

### Select by reference
To make the selection of specific elements easier inside your bit, you can use "references".
A reference is marked by a "data-ref" attribute in your HTML markup and can be selected
using $find() with the "@" prefix.

```this.$find('@reference')``` will resolve the element with the `data-ref="reference"` attribute on it.

::: tip

You can use reference selectors everywhere, where you can insert a css query selector.
This includes the `@Listener()` decorator, the `$on()` method, or the `$html()` renderer.

:::

### Select using a pivot element
To find only elements contained inside another html element you can use the "pivot" parameter
on both the `$find()` and `$findAll()` methods.

```this.$findAll('.exampleClass', this.$find('ul'))``` will only resolve the two li elements,
because the ul list is used as pivot, which does not include the div with the same class.

## Mount point boundary 

As stated above, the mount point is a hard boundary, that will not be crossed using `$find()`. 
The reason behind that is, that all selectors COULD theoretically be used in nested mounts as well,
and those we don't want to select. 

Let's look at a different HTML example:

```html
<b-mount type="example">
    <div class="exampleClass" id="1"></div>
    
    <b-mount type="child1">
        <div class="exampleClass" id="2"></div>
        
        <b-mount type="child2">
            <div class="exampleClass" id="3"></div>
        </b-mount>
    </b-mount>
</b-mount>
```

As you can see, we have three mounts stacked into each other. All three have a div with the "exampleClass" css class attached to them.
When your **example** executes ```this.$find('.exampleClass', true)``` the result will always be an array,
containing the div with id "1". "2" and "3" will automatically be removed by `$find`, because they are part of
a nested `b-mount` tag. 

The same is true, if you execute ```this.$find('.exampleClass', true)``` inside **child1**, the result will
only contain the div with id "2". "1" is ignored, because only elements inside the mount will be looked up,
"3", again, because it is part of a nested `b-mount` tag. 

### Crossing the borders

There might be cases where you don't want that behavior, so how do you cross the lines in both directions?

To access elements on a global scale, just use your normal ```document.querySelectorAll()``` and you should be good to go.
To access nodes in nested `b-mounts` you can set the third parameter of `$find()` to true, which tells it that you don't care about mount
point boundaries.

So, if you call ```this.$find('.exampleClass', true, true)``` in your **example** bit with the HTML structure from above,
you will receive an array (yes, still an array) of all three divs inside its scope.

## Finding the $closest() parents

Similarly to finding children, you can also resolve the "closest" elements to a specific node
using the `$closest()` method. The method takes a css selector, and a "pivot" element, from which
it will traverse the DOM tree upwards until it finds a matching node. The results are also
limited by the bounds of the mount point.

```html
<div class="outOfBounds" id="0">
    <b-mount type="example">
        <div class="exampleClass" id="1">
            <div class="foo" data-ref="foo" id="2">
                <div class="bar" data-ref="bar" id="3"></div>
            </div>
        </div>
    </b-mount>
</div>
```

The following will retrieve the div with id 2, because it is the the closest foo reference
to the bar node.
```this.$closest('@foo', this.$find('bar'))```

While this call will retrieve the div with id 1
```this.$closest('.exampleClass', this.$find('bar'))```

If you want to resolve the closest parent, ignoring the bounds of the current mount,
set the third parameter to true. This will retrieve the div with id 0, even if it is not
part of the currently active bit mount.
```this.$closest('.outOfBounds', this.$find('bar'), true)```
