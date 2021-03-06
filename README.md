# LABOR - Bits

Data binding and reactive re-rendering of HTML is a concept that lies at the foundation of all modern javascript frameworks like, react, vue or angular. While
their component based architecture and rendering of HTML in a virtual DOM (or whatever your framework calls it) is quite convenient, it is a commitment - If you
go the framework route, you do ALL HTML in your framework - no (classic) server side rendering of HTML in PHP, Java or Node for you. (Yes, I know you CAN do
something like it, but it ain't pretty).

## What it does

That's were bits come in handy. This library utilizes the web-component api to create javascript blocks/plugins/widgets on a statically rendered HTML page. Each
block or bit runs like a (web)component in your typical framework, but binds to the real/light dom instead of a virtual abstraction.

This library aims to do three things:

* Create a loose scaffold to structure the code of your javascript
* Simplify the data-binding between javascript and your dom
* Keep your head free from unbinding listeners or data when your bit/component is destroyed

## A word of caution

This is library is designed to be used with **typescript** and decorators. While you could use it without typescript, it is currently clearly not optimized to
run without it. If you like what you see, but typescript is a no-go for you, give me a shout, and we will figure something out :)

## Documentation

An extensive documentation of all features can be found [here](https://bits.labor.tools).

## Installation

Install this package using npm:

```
npm install @labor-digital/bits
```

## Browser support

The library supports all **modern** browsers, that have at least the most basic implementation of web-components. It also has a built-in polyfill for browsers
without the web-component api.

### Internet Explorer

Yes, you can use this library with the IE11, however you need to install some polyfills in you bundle if you want to support it. To install the polyfills you
need to install the following dependencies:

```
npm install @webcomponents/template core-js
```

If you are using webpack you can now add the following elements in your "entry" configuration:

```javascript
module.exports = {
    entry: [
        '@webcomponents/template/template.js',
        'core-js/features/object/assign',
        'core-js/features/object/is',
        'core-js/features/object/entries',
        'core-js/features/promise',
        'core-js/features/symbol',
        // This is your real entry point. Make sure the polyfills are added before
        // your main entry, otherwise they might not trigger correctly.
        './src/main.ts'
    ]
    // ... Your other webpack config
}
```

If you are not running webpack, simply import those files in your main.ts file

```typescript
import '@webcomponents/template/template.js';
import 'core-js/features/object/assign';
import 'core-js/features/object/is';
import 'core-js/features/object/entries';
import 'core-js/features/promise';
import 'core-js/features/symbol';
// Your other imports and code should be below those lines
```

## Postcardware

You're free to use this package, but if it makes it to your production environment, we highly appreciate you sending us a postcard from your hometown,
mentioning which of our package(s) you are using.

Our address is: LABOR.digital - Fischtorplatz 21 - 55116 Mainz, Germany.

We publish all received postcards on our [company website](https://labor.digital). 
