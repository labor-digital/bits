# Advanced reactivity
Reactivity, or [side effects how mobx calls it](https://mobx.js.org/reactions.html) is a core concept normally everything for your daily live should be handled by the data binding.
However, I know that there are cases where you need more fine-grained control over side effects.

## $watch() and @Watch()
While computed properties are more appropriate in most cases, there are times when a custom watcher is necessary.
This is most useful when you want to perform asynchronous or expensive operations in response to changing data.

Here is an example on how to bind watchers, both using the decorator or dynamically using the `$watch()` method in your `mounted` lifecycle hook.

```typescript
import {AbstractBit, Data, Watch} from '@labor-digital/bits';
export class ReactivityWatcher extends AbstractBit
{
    @Data()
    protected value: string = '';
    
    @Watch('value')
    protected staticWatcher(newValue: string, oldValue: string)
    {
        const msg = 'Static watcher, new value: "' + newValue + '", old value: "' + oldValue + '"';
        console.log(msg);
    }
    
    public mounted()
    {
        this.$watch('value', (newValue: string, oldValue: string) => {
            const msg = 'Watcher in "mounted", new value: "' + newValue + '", old value: "' + oldValue + '"';
            console.log(msg);
        });
    }
}
```

<Example href="/demo/examples/advanced-reactivity-watcher.html" :height="250"/>

::: tip

Statically defined watchers (using `@Watch`) will always be executed before dynamically defined watchers using `$watch()`

:::

## $autoRun() and @AutoRun
Autorun can be used in those cases where you want to create a reactive function that will never have observers itself.
This is usually the case when you need to bridge from reactive to imperative code, for example for logging,
persistence or UI-updating code.

As a rule of thumb: use autorun if you have a function that should run automatically but that doesn't
result in a new value.

When a method was decorated with Autorun, it will always be triggered once after the "mounted()" lifecycle method
and then again each time one of its dependencies changes.

Take a look at the [mobx autorun documentation](https://mobx.js.org/reactions.html#autorun) to learn more about the inner workings.

### $autoRun()
You can use this method anywhere in your code, to create an autorun handler on the fly.
For example in a click handler, to opt-in to automatic updates. 

```typescript
import {AbstractBit, Data, Listener} from '@labor-digital/bits';
export class ReactivityWatcher extends AbstractBit
{
    @Data()
    protected value: string = '';
    
    @Listener('click')
    public onClick()
    {
        this.$autoRun(() => {
            // Do stuff with the value
            console.log(this.value);
        });
        
        // This is only used to simplate a later update on value
        // Imagine this would another action in your bit instead :D 
        setTimeout(() => {
            this.value = Math.random();
        }, 1000);
    }
}
```

### @AutoRun()
Using the `@AutoRun` decorator on a method of your bit you can convert it into a static 
autorun handler. Those handlers are executed directly after the "mounted" lifecycle hook for the first time
and keep listening for changes in the observed values until the bit is destroyed.

You can use those static handlers to modify your DOM on state changes, for example in filter options, like here:

```typescript
import {AbstractBit, AutoRun, Data} from '@labor-digital/bits';
import {forEach} from '@labor-digital/helferlein';
export class AutoRunBit extends AbstractBit
{
    @Data()
    protected filter: string | null = null;
    
    @AutoRun()
    protected applyFilter(): void
    {
        const items = this.$findAll('@item');
        const filter = this.filter?.toLowerCase();
        
        if (!filter) {
            // If no filter is set, remove the display style, and show all items
            this.$style(items, {display: null});
        } else {
            // Iterate the items
            forEach(items, el => {
                const text = el.innerText ?? '';
                
                // Set the "display:none;" style on all elements that don't contain the "filter" value in the node text
                this.$style(el, {
                    display: text.toLowerCase().indexOf(filter) !== -1 
                        ? null : 'none'
                });
            });
        }
    }
}
```

<Example href="/demo/examples/advanced-reactivity-autorun.html" :height="380"/>

## @NonAction
By default, every method in a bit, that is not a "computed" or decorated using "@Listener", "@AutoRun" or "@Watch" will be
used as [action](https://doc.ebichu.cc/mobx/refguide/action.html) by the mobx reactivity handler.
There are some edge cases where you might not want that. In that case simply decorate the method in question using @NonAction,
and it will not be handled as action by mobx.

```typescript
import {AbstractBit, NonAction} from '@labor-digital/bits';
export class Example extends AbstractBit
{
    @NonAction()
    protected notAnAction(): void{
        
    }
}
```

::: tip

Because mobx is running in "strict" mode, it will warn you, if you modify observable data outside of an action.
To avoid this in a non-action method, you should either use this.$autoRun() or this.$runInAction() in your bit
when you update a property.

:::

## Objects as Data
In most of the examples we work with simple data values, like a string, or a number,
but you can also define Arrays, Maps, Sets and object literals as data/property.

```typescript
import {AbstractBit, Data} from '@labor-digital/bits';
export class Example extends AbstractBit
{
    @Data()
    protected data = {
        firstName: null,
        lastName: null,
        email: null
    };
}
```

You can bind nested properties as well, with `data-bind`, `data-bind-attr` and even with `data-model`:
```html
<b-mount type="example">
    <span data-bind="data.firstName" data-bind-attr="title:data.firstName"></span>
    <span data-bind="data.lastName"></span>
    <input type="text" data-model="data.email">
</b-mount>
```