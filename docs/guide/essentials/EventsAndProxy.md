# Events and $proxy
As an event driven language, listening for and emitting events is an integral part of your daily work.
For that reason bits provides you some tools to keep your head free of chores like listener unbinding.

## DOM Events

Bits has no "event-abstraction", every event you fire will be emitted as a [custom event](https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events) on the actual dom.
This means you can interact with virtually any other js library out of the box. 

### Listening to Events

In the [reactivity section](/guide/Reactivity.md#bind-event-listeners) you already learned how to use the `@Listener` typescript decorator.
It allows you to create static listener bindings to dom nodes. In addition to that you can use the `$on` method, which is part of your bit class.

```typescript
import {AbstractBit, Data} from '@labor-digital/bits';
export class Example extends AbstractBit {
    mounted(){
        this.$on('click', function(e: MouseEvent){
            console.log(e.target);
        })
    }
}
```

As you see this works exactly like your normal javascript event listener. By default, the event listener will be 
bound to the `b-mount` of the current bit. To change the "target" to bind the listener to, you can specify it as the first parameter:
This will bind the click handler on an element with the given id.

```typescript
this.$on('#an-id', 'click', e => console.log(e.target));
```

You can use any dom element for this, the "@"-reference format or set it to TRUE to bind a listener to the [event bus](/guide/EventsAndProxy.md#event-bus).

::: tip Into the multiverse

You can also select multiple targets:

```typescript
this.$on('#an-id,#another-id', 'click', e => console.log(e.target));
```

And/or multiple events to be bound:

```typescript
this.$on('#an-id,#another-id', ['click', 'dblclick'], e => console.log(e.target));
```

**PRO-tip:** This works for the `@Listener` decorator as well.
:::

### Emitting events

Naturally you want to emit your own events to tell other parts of the script that something happened. 
For those cases you can use `$emit()`, which create a new event and dispatch it on the DOM tree for you.

Similar to `$on()`, it will emit the event on the `b-mount` if you don't provide a specific target:
```typescript
this.$emit('customEvent');
```

To provide a target, set it as first argument:
```typescript
this.$emit('#an-id', 'customEvent');
```

You can also provide an object containing additional attributes that should be transported by your event.

```typescript
this.$emit('#an-id', 'customEvent', {someData: 123});
```

In a listener you can then retrieve this value by using the "args" node

```typescript
import {TCustomEvent} from './types';

this.$on('#an-id', 'customEvent', function (e: TCustomEvent){
    console.log(e.args.someData); // 123
})
```

## Do stuff by $proxy()

Imagine the following: Your bit needs outside connections, either to listen for DOM events, other libraries, hooks into a promise chain,
registers a callback, you get the gist. But what if your bit gets destroyed? You have to unbind all event listeners, decouple
all callbacks, cancel all timeouts and intervals. 

Have you ever tried to "un-register" a then() in a promise chain?
Did you ever forget a single listener that lead to a memory leak?

Not anymore, I tell you! Behold the sparkling new ComponentProxy-2000 and enter the world of proxying everything
your bit does with the outside world.

::: tip

Under the hood: `$on()` and `$emit()`, will work with the proxy object, by default. The proxy
object will be destroyed as soon as the bit gets destroyed, which means all listeners will automatically be unbound.

An in-depth documentation of the proxy object can be found [here](https://helferlein.labor.tools/classes/entities_componentproxy.componentproxy.html).

:::

If your bit has additional outside connections, you can use the proxy (using `this.$proxy` in your bit class) 
for virtually anything:

#### Set timeouts or intervals:
If your bit gets destroyed before the timeout ends, it will never trigger.
```typescript
this.$proxy.setTimeout(() => {
    console.log('foo');
},5000);
```

::: tip

You can clear timeouts and intervals using the proxy, too.

```typescript
const t = this.$proxy.setTimeout(() => {},5000);
this.$proxy.clearTimeout(t);
```
:::

#### Set an external callback
If your bit gets destroyed before the callback is executed, the wrapped function will not be executed.
```typescript
someLongRunningFunction(this.$proxy.callbackProxy(
    function(){
        console.log('callback done!');
    }
));
```

#### Break a promise chain
If your bit gets destroyed before the promise gets resolved, the proxy will break the promise chain to prevent
issues like no longer defined properties.

```typescript
asyncMethodReturningAPromise()
    .then(this.$proxy.promiseProxy())
    .then((argument) => {
        console.log('promise was resolved', argument);
    });
```

#### Watch for mutations
`this.$proxy.bind()` is the underlying api `$on()` uses to register event listeners.
You can utilize this method as well to register [mutation observers](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) on the DOM.

```typescript
this.$proxy.bind(document.getElementById('my-el'), '@mutation', function(){
    console.log('mutation!');
})
```

## Event Bus

Sometimes you need a quick and easy solution to pass data between your bits. Of course,
you could use `$emit()` and an event listener to do this, but what if your HTML looks like this:

```html
<body>
    <div>
        <b-mount type="a"></b-mount>
    </div>
    <nav>
        <div>
            <b-mount type="b"></b-mount>
        </div>
    </nav>
</body>
```

Both mounts could emit an event using `$emit` but never reach each other, because DOM events only travel upwards
and do not propagate into child branches. 

For those cases the bits library offers you a simple **EventBus**. EventBus allows us to emit an event in one component and listen for that event in another,
without worrying about their location in the DOM. You do this by specifying TRUE as a target for both your event listener and when you emit the event.

"mounted" hook of "a":
```typescript
this.$on(true, 'myEvent', function(){
    console.log('handled a custom event!');
});
```

"mounted" hook of "b":
```typescript
this.$proxy.setTimeout(() => {
    this.$emit(true, 'myEvent');
}, 1000);
```

After one second "b" will emit the event on the eventBus that comes built-in, and the "a" bit will
receive the event to show you the log output.

::: tip

Events on the event bus support additional data, like DOM events, too. So, this works:

```typescript
this.$emit(true, 'customEvent', {someData: 123});
```

:::

## Global Event Listeners

To take action on events emitted on the event bus, you can create listeners on a per-app level.
It can be done easily using the "events" option inside the app configuration object. Inside the object,
the "key" is the name of the event to listen to, and the value is the actual listener.

```typescript
import {BitApp} from '@labor-digital/bits';

new BitApp({
    // ... other options
    events: {
        globalEvent: (e, app) => {
            console.log('Global event handler triggered', 'event', e, 'app', app);
        }
    }
});
```

::: tip
Other than normal event listeners app event listeners always retrieve the "app" instance as a second parameter.
:::
