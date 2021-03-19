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

<Example href="/demo/examples/docs-reactivity-watcher.html" :height="250"/>

::: tip

Statically defined watchers (using `@Watch`) will always be executed before dynamically defined watchers using `$watch()`

:::

## $autoRun()
"The `$autoRun` function accepts one function that should run every time anything it observes changes. It also runs once when you create the autorun itself."

You can use this in your `mounted` lifecycle hook to create an autorun handler, there is currently no decorator for that.

Take a look at the [mobx autorun documentation](https://mobx.js.org/reactions.html#autorun) to learn more about the inner workings.


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