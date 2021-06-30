/*
 * Copyright 2021 LABOR.digital
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Last modified: 2021.04.12 at 17:55
 */

import {cloneList, forEach, isPlainObject, isUndefined, makeOptions, merge} from '@labor-digital/helferlein';
import type {BitMountHTMLElement} from '../Mount/types';
import {Translator} from './Translator';
import {TranslatorContext} from './TranslatorContext';
import type {IBitAppTranslationOptions} from './types';

export class TranslatorFactory
{
    /**
     * The options provided for to the app through
     * @protected
     */
    protected _options?: IBitAppTranslationOptions;
    
    /**
     * The context object that holds all relevant information
     * @protected
     */
    protected _context?: TranslatorContext;
    
    constructor(options?: IBitAppTranslationOptions)
    {
        this._options = options ?? {};
    }
    
    /**
     * Returns the context object that contains all relevant information about the translation process
     */
    public get context(): TranslatorContext
    {
        if (!this._context) {
            this._context = this.initializeContext();
        }
        return this._context;
    }
    
    /**
     * Returns the global translator instance, which is not bound to a specific mount
     */
    public requireGlobalTranslator(): Translator
    {
        const ctx = this.context;
        return new Translator(
            ctx.lang,
            ctx
        );
    }
    
    /**
     * Public factory to require a translator instance for a single bit.
     */
    public requireTranslator(mount: BitMountHTMLElement): Translator
    {
        const ctx = this.context;
        return new Translator(
            mount.getAttribute('lang') ?? ctx.lang,
            ctx
        );
    }
    
    /**
     * Initializes the provider by finding and preparing the options and creating the low-level translator
     * @protected
     */
    protected initializeContext(): TranslatorContext
    {
        let options: IBitAppTranslationOptions = cloneList(this._options ?? {});
        delete this._options;
        
        let lang: string = options.lang ?? document.documentElement.lang ?? 'en';
        this.preparePhrases(options, lang);
        
        if (!options.disableJsOptions) {
            options = this.findDomOptions(options, lang);
        }
        
        options = this.validateOptions(options, lang);
        
        const ctx = new TranslatorContext(options.lang!, options.fallbackLang ?? options.lang!);
        
        forEach(options.phrases!, (_phrases, _lang) => {
            ctx.addPhrases(_lang, _phrases);
        });
        
        // Todo we could steal those pluralization rules https://github.com/airbnb/polyglot.js/blob/master/index.js#L48
        forEach(options.pluralRules!, (rule, _lang) => {
            ctx.addPluralRule(_lang, rule);
        });
        
        return ctx;
    }
    
    /**
     * Validates the translation options based on our schema
     * @param options
     * @param lang
     * @protected
     */
    protected validateOptions(options: IBitAppTranslationOptions, lang: string): IBitAppTranslationOptions
    {
        return makeOptions(options, {
            lang: {
                type: 'string',
                default: lang
            },
            fallbackLang: {
                type: ['string', 'undefined'],
                default: undefined
            },
            disableJsOptions: {
                type: 'boolean',
                default: false
            },
            phrases: {
                type: 'plainObject',
                default: () => ({})
            },
            pluralRules: {
                type: 'plainObject',
                default: () => ({})
            }
        });
    }
    
    /**
     * Finds the translation options "globally" in the dom
     * @protected
     * @param options
     * @param lang
     */
    protected findDomOptions(options: IBitAppTranslationOptions, lang: string): IBitAppTranslationOptions
    {
        let els: Array<HTMLElement> = [];
        forEach(document.querySelectorAll('script[data-bit-translation]') as any, (el: HTMLElement) => {
            els.push(el);
        });
        
        forEach(els, el => {
            const _options = this.parseSingleNodeContent(el.innerText, el.getAttribute('lang') ?? lang);
            if (isUndefined(_options)) {
                return;
            }
            
            options = merge(options, _options) as any;
        });
        
        return options;
    }
    
    /**
     * Parses the content of a single translation node and unifies the possible definition types into a valid object
     * @param content
     * @param lang
     * @protected
     */
    protected parseSingleNodeContent(
        content: string,
        lang: string
    ): IBitAppTranslationOptions | undefined
    {
        let data: any;
        try {
            data = JSON.parse(content);
        } catch (e) {
            console.error('Failed to parse the translation definition', content, e);
            return undefined;
        }
        
        if (isPlainObject(data) && !data.locale && !data.defaultLocale && !data.phrases) {
            data = {
                phrases: data
            };
        }
        
        this.preparePhrases(data, lang);
        
        return data;
    }
    
    /**
     * Makes sure the "phrases" object is correctly formatted for our needs
     * @param data The data to prepare the phrases in
     * @param lang language hint provided by the "lang" attribute of dom options, or the default language code
     * @protected
     */
    protected preparePhrases(data: IBitAppTranslationOptions, lang: string): IBitAppTranslationOptions
    {
        if (isPlainObject(data.phrases)) {
            let onlyTwoChars = true;
            forEach(Object.keys(data.phrases), key => {
                if (key.length !== 2) {
                    onlyTwoChars = false;
                    return false;
                }
            });
            
            if (!onlyTwoChars) {
                data.phrases = {[lang]: data.phrases};
            }
        } else {
            data.phrases = {};
        }
        
        return data;
    }
}