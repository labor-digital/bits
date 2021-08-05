# Translator

Even with the premise, that most of your translations will come directly from your server rendering engine,
there will be the need to translate labels in your javascript. Either in an external library, or the text in a modal window you simply can not provide everything via HTML (or, you can, but you should not want to...).

For that reason this plugin offers an ultra-lightweight translation provider that is designed to work in tandem with you server template engine.

<Example href="/demo/examples/plugin-translator.html" :height="450"/>

## Installation 

::: tip

Until the next major release, the translator is [part of the core distribution](../advanced/Translations.md). 
So, you can install it as a plugin to be ready for a v2 update, but don't need to, yet.

:::

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

## Configuration
You have two ways to configure the translation provider. The first option is to provide configuration
directly when you create the translator plugin instance, the second one is your HTML markup.

### Through Javascript

```typescript
import {BitApp} from '@labor-digital/bits';
import TranslatorPlugin from '@labor-digital/bits-translator';

new BitApp({
    bits: { /* ... */ },    
    plugins: [
        new TranslatorPlugin({
            phrases: {
                label: "Hello world"
            }
        })
    ]
});
```

This way you define the phrases, for the default language code. The language code is the ISO 639 code of the language,
so "en", "de", "cn",... If it is not directly provided in the configuration using the `lang` option, the app
will use the ["lang" attribute on your html tag](https://www.w3.org/International/questions/qa-html-language-declarations) to determine the code for you.

To scale up your setup, you can provide phrases for multiple languages as well:

```typescript
import {BitApp} from '@labor-digital/bits';
import TranslatorPlugin from '@labor-digital/bits-translator';

new BitApp({
    bits: { /* ... */},
    plugins: [
        new TranslatorPlugin({
            phrases: {            
                de: {
                    label: "Hallo Welt"
                },
                en: {
                    label: "Hello world"
                }
            }
        })
    ]
});
```

### Trough HTML
When the translator is required for the first time, it will automatically scan the DOM tree and search `script` tags that have the `data-bit-translation` attribute on them.
It expects to find JSON objects with your configuration in them, but gives you multiple ways on how to provide the data:

Either use, the same syntax you would use in the plugin constructor...
```html
<script type="application/json" data-bit-translation>
    {
        "phrases": {
            "en": {
               // ...
            },
            "de": {
                // ...
            }
        }
    }
</script>
```

... provide only the phrases...
```html
<script type="application/json" data-bit-translation>
    {
        "en": {
           // ...
        },
        "de": {
            // ...
        }
    }
</script>
```

... or provide only the phrases of a single language. Please note, that we use the `lang` attribute to define the langauge code the phrases should be set for.
If you omit the `lang` attribute, the phrases are loaded for the default language code.
```html
<script type="application/json" data-bit-translation lang="en">
    {
        "label": "Hello world"
    }
</script>
```

::: tip

The last variant allows you to create a bridge between your server templating engine and your frontend translator extremely easy.

:::

## Usage

You can use the translator in any bit instance using `this.$t('label')`, no further setup is required. With that in mind,
we can take a look on the source code of the example you see on top of this page

```typescript
import {AbstractBit} from '@labor-digital/bits';

export class Translation extends AbstractBit
{
    public mounted()
    {
        this.$find('@globalLabel')!.innerText = this.$t('globalString');
        this.$find('@localLabel')!.innerText = this.$t('translated.label');
        this.$find('@lang')!.innerText = this.$translator.lang;
    }
}
```

You can also access the `this.$translator` instance directly, which provides the `lang` property, and the `translate()` method.

### Language fallbacks
The bits translator tries to directly look up any given language code you provide (even if you provide it implicitly `html`).
But it will automatically fall back to the "generalized" language, if the specific language is not present.

This means, if you register phrases for: "en", "de" and "es", like in our example, and set your html `lang` attribute to "en-US" or "de-AT" it will still
work as before, because the translator automatically falls back to the generalized language.

### Bit language
The bits of a single app inherit the language code you either defined, or that is loaded from the html tag.
But you can also change the language for a single bit if you want to. To do that, simply add the `lang` attribute
with the required language code to the `b-mount` tag. This will set the language for this bit only.

```html
<b-mount type="translation" lang="de"></b-mount>
```

### Placeholders

You can also work with placeholders in your translation labels, that can be substituted with actual values.
The first option is to use the "sprintf" syntax, which will help when you use your PHP translation labels:

```json
{ 
  "label": "Hello world, it is %s"
}
```
```typescript
console.log(this.$t('label', ['monday']));
```

You can also use named markers to achieve the same:
```json
{ 
  "label": "Hello world, it is {{day}}"
}
```
```typescript
console.log(this.$t('label', {day: 'monday'})); // Prints "Hello World, it is monday"
```

### Pluralization

You can use pluralization either based on a named marker called `count`, or by providing the `count` option, as third parameter,
to the "translate" method (if you want to work with "sprintf" replacements). Provide an array of variants instead of a single label:

```json
{ 
  "label": [
    "This is a day",
    "Those are {{count}} days"
  ]
}
```

```typescript
console.log(this.$t('label', {count: 0}));  // Prints "Those are 0 days"
console.log(this.$t('label', {count: 1}));  // Prints "This is a day"
console.log(this.$t('label', {count: 2}));  // Prints "Those are 2 days"
```

To use count and an array of arguments, write it like this:
```json
{ 
  "label": [
    "This is a %s day",
    "Those are {{count}} %s days"
  ]
}
```

```typescript
console.log(this.$t('label', ['beautiful'], {count: 1}));  // Prints "This is a beautiful day"
console.log(this.$t('label', ['beautiful'], {count: 2}));  // Prints "Those are 2 beautiful days"
```

::: tip

As you can see, you can still use ```count``` as a placeholder in your label, even if it is not part of your given arguments.

:::

#### Custom rules

The translator ships only with a fairly simple "rule" of pluralization: `(count === 1) ? 0 : 1` which means, if the given count is 1 use the index 0
in the label array, in all other cases use 1. For english, german, spanish and a lot of other languages, this is fine. You can also provide additional
pluralization rules through the `lang` option. You can [take a peek at airbnb's polyglot](https://github.com/airbnb/polyglot.js/blob/master/index.js#L48)
to get inspired on how a plural rule can look.

If we want to register a new rule for french, simply provide it like this:

```typescript
import {BitApp} from '@labor-digital/bits';
import TranslatorPlugin from '@labor-digital/bits-translator';

new BitApp({
    bits: { /* ... */ },
    plugins: [
        new TranslatorPlugin({
            /* ... */
            pluralRules: {
                fr: count => count >= 2 ? 1 : 0
            }
        })
    ]
});
```