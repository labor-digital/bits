# Dependency Injection

While you are working on a website you will get to the point, where you need some logic that repeats itself,
or an external library like axios to provide functionality. You can't always put those into components
or mixins. So you create a "service", some part of your codebase that does something in encapsulation.
Those services may or may not depend on each other, so you need to wire them together and use them
in your bit components later.

## Whats dependency injection

You can define a service by first creating a class, somewhere in your code. For our example, we want a simple 
class that returns a string value whenever the getString() method is executed:

```typescript
export class StringService {
    public getString(): string{
        return 'Hello World'
    }
}
```

Secondly we create another service to log our string to the console:

```typescript
export class LoggerService
{
    protected _stringService: StringService;
    
    constructor(stringService: StringService) {
        this._stringService = stringService;
    }
    
    public logString(): void{
        console.log(this._stringService.getString());
    }
}
```

As you can see, LoggerService gets the StringService "injected" as a constructor parameter and 
uses it when the logString() method is executed. This is the basic principle of dependency injection.
To create the LoggerService you would now write something like this:

```typescript
const logger = new LoggerService(new StringService());
logger.logString();
```

In this fairly simple example there is no harm in doing it like this, but how does this scale
if your service has more than a single dependency? Or a dependency has dependencies as well?

For that we use a "container" that handles the wiring of the dependencies for us. 

::: warning

This is the most basic way of describing it. If you are new to dependency injection,
you can take a look at the [wikipedia page of the topic](https://en.wikipedia.org/wiki/Dependency_injection)

:::

## Defining services

In a bits app, you can use the "services" option to define a list of services by a common "alias",
the "service key". Each service key has a factory function which creates the service instance on demand.
The instance itself will then be stored inside the container for later usage.

```typescript
import {BitApp, DiContainer} from 'dist/index';

new BitApp({
    // ... other options
    services: {
        
        stringService: () => new StringService(),
        loggerService: (c: DiContainer) => new LoggerService(c.stringService)
    
    }
});
```

As you can see in the code, we create two factories, the first one creates the string service,
the second one the logger service. Each factory receives the instance of the container as a parameter,
which you can use to retrieve other services with. Using this method you can create chains of
dependent services, that will only be created when needed.

### Autocompletion 

To help your IDE to figure out which service keys exist on the di container,
and to which services they resolve, you can take advantage of typescript.

Create a globals.d.ts file next to your index file and extend the DiContainer module there
with the keys and the matching services.

```typescript
declare module '@labor-digital/bits/dist/Core/Di/DiContainer'
{
    interface DiContainer
    {
        stringService: StringService,
        loggerService: LoggerService
    }
}
```

## Retrieving Services

To retrieve service instances inside your bits you can use the ``$di`` special property in the bit class.
If you added the autocompletion correctly, you can even see which services are available in the container.

```typescript
import {AbstractBit} from '@labor-digital/bits';
export class Example extends AbstractBit {
    mounted(){
        this.$di.loggerService.logString();
    }
}
```
