# Lifecycle

Lifecycle hooks allow you to perform certain actions at key points of the bit execution. 
That makes it easy to bind your event listeners, modify the dom or clean up when the bit is destroyed.

In this example you can see how and when lifecycle hooks are emitted. 

<Example href="/demo/examples/essentials-lifecycle.html" :height="450"/>

## Bit boot-up
The bit classes you write are no real web components, but instead only classes that are glued to a DOM node
through the `b-mount` tag. This means the boot process is handled by the mount in the following order:

* Browser executes the connectedCallback() method on the mount element
* The Mount.connect() method is executed by the adapter 
* Two possible cases can occur:
  1. The bit class constructor gets resolved through the bit registry of the app. 
        * The bit instance is created
        * "created" lifecycle hook is executed
        * The reactivity provider is bound to the instance
        * The instance gets connected to the DOM through the binder
        * The content of "innerHTML" of the mount node gets cloned and stored for the destruction
        * "mounted" lifecycle hook is executed     
        * Static "autoRun" methods (decorated using @AutoRun) are executed
  2. The mount node has the "keep-alive" attribute, and holds already existing bit instance. 
        * The mount re-uses the already stored bit instance
        * "remounted" lifecycle hook is executed

After this point your bit is considered "running" and can react to data-changes and DOM-events.

## Bit destruction
* Browser executes the disconnectedCallback() method on the mount element
* The Mount.disconnect() method is executed by the adapter
* "unmounted" lifecycle hook is executed
* Two possible cases can occur:
    1. The `b-mount` has the "keep-alive" attribute set to any value.
        * The bit instance and all dom bindings are kept alive and wait for a rebinding later.
    2. The bit instance will be destroyed 
        * "beforeDestroy" lifecycle hook is executed
        * The reactivity provider pulls down the data-binding
        * DOM-binding and event handlers are disconnected by the binder
        * The $proxy instance is destroyed and unlinks all dependencies.
        * The bit $context is destroyed
        * "destroyed" lifecycle hook is executed.
        * The "innerHTML" of the mount point will be reset
          to the original state we stored in the boot-up process. 
          (We do this, so if the node is rebound, the instance will be bound to the original HTML without having to deal with a possibly modified DOM of previous incarnations).
    
At this point all references to the outside world should be severed, and the
instance will be flushed by the garbage collector.

## DOM binding and keep-alive
By default, the bit instance is destroyed when the bound `b-mount` was disconnected from the dom.
This happens if you either remove the node, **OR EVEN** if you **move** it to another location in the dom tree (using appendChild() for example).

If you know, that you want to reuse the bit after you moved it around,
simply add the "keep-alive" attribute with any content to the mount tag.
That ensures that the bit instance, and the innerHTML of the mount node stay alive
until you rebind it again to the DOM. 

::: warning

Make sure not to over-use this feature! Every bit kept-alive will hold on to its mount and child DOM nodes. Meaning neither the node, nor
the bit itself will be deleted by the garbage collector. 

:::

## Available hooks

All lifecycle hook methods act as normal methods on your bit object. This means that the
bit instance is already bound to the `this` context. Please keep in mind, that there in "created"
the DOM is not yet bound, and in "destroyed" the instance is already destroyed, plus you don't have access to $el or the $context anymore.

### created

Executed immediately after the bit instance was created. There is no data reactivity or dom binding yet.
I would suggest, to see this as your constructor, to set up dependencies that you need in your bit.

::: tip
While it is possible to override the constructor of the bit class, I would suggest not to do that. Please refer to the "created" hook instead.
:::

### mounted

This is probably your "go-to" lifecycle hook, as it is executed when the bit was connected to the DOM the **first time**. 
All data reactivity has been set up and statically defined event listeners have been bound.

### unmounted

The bit is technically still alive but was disconnected from the dom. You can use this hook to remove global event listeners,
that were not bound using the $on() method of your bit. 

### remounted

Behaves exactly like "mounted" but with the exception, that the bit was already part of the DOM and got removed beforehand (keep-alive was used).

### beforeDestroy

The bit is about to be destroyed and already disconnected from the dom.
This allows you to pull-down any dependencies before all connections to the outside world are cut.

### destroyed

The data-binding and DOM connections are cut, the `$el` as well as `$context` and `$proxy` are unlinked.
The content of the `b-mount` has been restored to its initial state when the bit was created.

### domChanged

This is more or less a "pseudo" lifecycle hook, as it is not really part of the lifecycle but more of a 
wildcard event handler. It is executed if either the current, or a child bit executed the `$domChanged()` method.
That will emit an event which bubbles up the DOM tree and tells all bits on the way that they should refresh
their DOM bindings. This is used if you modify the dom manually/from an external source, and now want the bits to bind themselfs again.

## App Lifecycle

Similar to a single bit, the bit app itself has some lifecycle hooks
which you can use either directly (through the app config), or when
writing [plugins](../plugins/WritePlugins.md).

### created

Executed when the app gets created, right after the options have been
validated, and the dependency injection container was created.
Configured through ```new BitApp({hooks: {created: () => {}}});```

### mounted

Executed after the app was mounted on the DOM and the bit instances
have been created.
Configured through ```new BitApp({hooks: {mounted: () => {}}});```