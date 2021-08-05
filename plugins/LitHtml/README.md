# LABOR - Bits - Lit Html

While bits has the dedicated scope of working with server rendered HTML, and provides some
basic JS templating functionality, you might want to get a bit more sophisticated.

For this I trust in the standalone templating engine [lit-html](https://lit.dev/docs/libraries/standalone-templates/)
which is part of the [lit web component framework](https://lit.dev/).

## Installation

Install the plugin through npm:

```
npm install @labor-digital/bits-lit-html
```

Register it in your plugin section:

```typescript
import {BitApp} from '@labor-digital/bits';
import {LitHtmlPlugin} from '@labor-digital/bits-lit-html';

new BitApp({
    bits: { /* ... */},
    plugins: [
        new LitHtmlPlugin()
    ]
});
```

## Documentation

The documentation can be found [here](https://bits.labor.tools/guide/plugins/LitHtml.html).

## Postcardware

You're free to use this package, but if it makes it to your production environment, we highly appreciate you sending us a postcard from your hometown,
mentioning which of our package(s) you are using.

Our address is: LABOR.digital - Fischtorplatz 21 - 55116 Mainz, Germany.

We publish all received postcards on our [company website](https://labor.digital). 
