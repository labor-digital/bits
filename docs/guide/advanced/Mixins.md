# Mixins
Mixins allow you to create reusable code, that can be distributed within multiple bits of your page. 
A mixin is at its core a bit itself and therefore hold all lifecycle hooks, methods, properties and computed properties.

Lifecycle hooks with the same name are merged and executed in sequence of their definition. Mixin hooks will be called before the component’s own hooks.

Here is a simple example of a mixin:
```typescript
import {AbstractBit, Listener} from '@labor-digital/bits';

export class ClickHandlerMixin extends AbstractBit
{
    @Listener('click', 'button')
    public onButtonClick()
    {
        alert('A button was clicked!');
    }
    
    protected handleClick()
    {
        alert('The "handleClick" method of the ClickHandlerMixin was executed');
    }
    
    public mounted()
    {
        console.log('Mixin "mounted" lifecycle hook was executed');
    }
}
```

Which you can then use in your bit as a mixin. By using the `mixins` helper, TypeScript can infer mixin types and inherit them on the bit class itself.
The typescript definition behind this feature is kinda crazy and I have to give kudos to [the people at vue-class-component](https://github.com/vuejs/vue-class-component/blob/master/src/util.ts#L35) as I used their "mixins" definition as base(*cough* copied) for my implementation.

```typescript
import {Listener, mixins} from '@labor-digital/bits';
import {ClickHandlerMixin} from './clickHandlerMixin';

export class ExtendedBit extends mixins(ClickHandlerMixin)
{
    @Listener('click', '@mixinButton')
    public onMixinButton()
    {
        this.handleClick();
    }
    
    public mounted()
    {
        console.log('Bit "mounted" lifecycle hook was executed');
    }
}
```

As you can see, we use "mixins" as a parent here, therefore you don't have to extend `AbstractBit` manually. Additionally you can see, that it is possible to inherit the "decoration" like @Listener from mixins allowing you even more flexibility.

The HTML will look exactly the same as it would with everything written in a single bit:
```html
<b-mount type="extended">
    <div>
        <button>Click for alert</button>
        <div data-ref="mixinButton">Click to trigger function</div>
    </div>
</b-mount>
```

<Example href="/demo/examples/advanced-mixins.html" :height="290"/>
