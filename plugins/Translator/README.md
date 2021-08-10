# LABOR - Bits - Translator

Even with the premise, that most of your translations will come directly from your server rendering engine,
there will be the need to translate labels in your javascript. Either in an external library, or the text in a modal window you simply can not provide everything via HTML (or, you can, but you should not want to...).

For that reason this plugin offers an ultra-lightweight translation provider that is designed to work in tandem with you server template engine.

## Installation

Install the plugin through npm:

```
npm install @labor-digital/bits-translator
```

Register it in your plugin section:

```typescript
import {BitApp} from '@labor-digital/bits';
import {TranslatorPlugin} from '@labor-digital/bits-translator';

new BitApp({
    bits: { /* ... */},
    plugins: [
        new TranslatorPlugin()
    ]
});
```

## Documentation

The documentation can be found [here](https://bits.labor.tools/guide/plugins/Translator.html).

## Postcardware

You're free to use this package, but if it makes it to your production environment, we highly appreciate you sending us a postcard from your hometown,
mentioning which of our package(s) you are using.

Our address is: LABOR.digital - Fischtorplatz 21 - 55116 Mainz, Germany.

We publish all received postcards on our [company website](https://labor.digital). 

