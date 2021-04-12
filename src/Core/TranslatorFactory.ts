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
 * Last modified: 2021.04.09 at 20:17
 */

import {
    cloneList,
    forEach,
    isFunction,
    isPlainObject,
    isString,
    isUndefined,
    makeOptions,
    merge
} from '@labor-digital/helferlein';
import * as translate from 'translate-js';
import {Translator} from '../Tool/Translator';
import type {BitMountHTMLElement} from './Mount/types';
import type {IBitAppTranslationOptions, TLowLevelTranslator} from './types';

export class TranslatorFactory
{
    /**
     * The options provided for to the app through
     * @protected
     */
    protected _options?: IBitAppTranslationOptions;
    
    /**
     * The globally configured locale name
     * @protected
     */
    protected _locale?: string;
    
    /**
     * The low level translator instance
     * @protected
     */
    protected _lowLevelTranslator?: TLowLevelTranslator;
    
    constructor(options?: IBitAppTranslationOptions)
    {
        this._options = options ?? {};
    }
    
    /**
     * Public factory to require a translator instance for a single bit.
     * If bitLocale and bitPhrases are empty a shared, global translator object will be returned.
     */
    public requireTranslator(mount: BitMountHTMLElement): Translator
    {
        this.initialize();
        return new Translator(
            this.ensureLocale(mount.getAttribute('lang') ?? this._locale),
            this._lowLevelTranslator!
        );
    }
    
    /**
     * Initializes the provider by finding and preparing the options and creating the low-level translator
     * @protected
     */
    protected initialize(): void
    {
        if (this._lowLevelTranslator) {
            return;
        }
        
        let options = cloneList(this._options ?? {});
        delete this._options;
        options.locale = this.ensureLocale(options.locale);
        options.defaultLocale = this.ensureLocale(options.defaultLocale ?? 'en');
        options = this.preparePhrases(options);
        
        if (!options.disableJsOptions) {
            options = this.findDomOptions(options);
        }
        
        options = this.validateOptions(options);
        
        const locale = this._locale = options.locale!;
        const phrases = options.phrases!;
        const defaultLocale = options.defaultLocale!;
        
        const lowLevel = translate.createRegistry();
        
        lowLevel.whenUndefined = (key, locale) => {
            const defaultPhrases = phrases[defaultLocale!] ?? {};
            if (defaultPhrases[key]) {
                return defaultPhrases[key];
            }
            
            console.warn('Missing translation for key: "' + key + '" in locale: "' + locale + '"');
            return key;
        };
        
        lowLevel.setLocale(locale);
        forEach(options.phrases ?? {}, (_phrases, locale) => {
            lowLevel.add(_phrases, locale);
        });
        
        if (isFunction(options.configurator)) {
            options.configurator(lowLevel);
        }
        
        this._lowLevelTranslator = lowLevel;
    }
    
    /**
     * Validates the translation options based on our schema
     * @param options
     * @protected
     */
    protected validateOptions(options: IBitAppTranslationOptions): IBitAppTranslationOptions
    {
        const maxLength = function (v: string | undefined, k: string): string | boolean {
            if (!isUndefined(v) && v.length !== 2) {
                return 'The given "' + k + '" (' + v
                       + ') must be exactly two characters long!';
            }
            return true;
        };
        
        return makeOptions(options, {
            locale: {
                type: ['string', 'undefined'],
                default: undefined,
                validator: maxLength
            },
            defaultLocale: {
                type: ['string', 'undefined'],
                default: undefined,
                validator: maxLength
            },
            disableJsOptions: {
                type: 'boolean',
                default: false
            },
            phrases: {
                type: 'plainObject',
                default: () => ({})
            },
            configurator: {
                type: ['callable', 'undefined'],
                default: undefined
            }
        });
    }
    
    /**
     * Makes sure that the configured locale is given, or uses the html lang attribute as fallback.
     * Also validates that the locale has the correct iso 2-char format
     *
     * @param locale
     * @protected
     */
    protected ensureLocale(locale?: string): string
    {
        if (!isString(locale)) {
            locale = document.documentElement.lang ?? this._locale ?? 'en';
        }
        
        if (locale.length === 5) {
            locale = locale.substr(0, 2);
        }
        
        if (locale.length !== 2) {
            console.error('Invalid locale given: "' + locale + '" only strings with 2 or 5 characters are allowed!');
            locale = this._locale ?? 'en';
        }
        
        return locale.toLowerCase();
    }
    
    /**
     * Finds the translation options "globally" in the dom
     * @protected
     * @param options
     */
    protected findDomOptions(options: IBitAppTranslationOptions): IBitAppTranslationOptions
    {
        let els: Array<HTMLElement> = [];
        forEach(document.querySelectorAll('script[data-bit-translation]') as any, (el: HTMLElement) => {
            els.push(el);
        });
        
        forEach(els, el => {
            const _options = this.parseSingleNodeContent(el.innerText, el.getAttribute('lang'));
            if (isUndefined(_options)) {
                return;
            }
            
            _options.locale = this.ensureLocale(_options.locale ?? options.locale);
            _options.defaultLocale = this.ensureLocale(_options.defaultLocale ?? options.defaultLocale);
            
            options = merge(options, _options) as any;
        });
        
        return options;
    }
    
    /**
     * Parses the content of a single translation node and unifies the possible definition types into a valid object
     * @param content
     * @param phrasesLocale
     * @protected
     */
    protected parseSingleNodeContent(
        content: string,
        phrasesLocale: string | null
    ): IBitAppTranslationOptions | undefined
    {
        let data: any;
        try {
            data = JSON.parse(content);
        } catch (e) {
            console.error('Failed to parse the translation definition', content, e);
            return undefined;
        }
        
        let locale = this.ensureLocale(data.locale);
        
        if (isPlainObject(data) && !data.locale && !data.defaultLocale && !data.phrases) {
            data = {
                phrases: data
            };
        }
        
        data.locale = locale;
        
        this.preparePhrases(data, phrasesLocale);
        
        return data;
    }
    
    /**
     * Makes sure the "phrases" object is correctly formatted for our needs
     * @param data The data to prepare the phrases in
     * @param phrasesLocale Optional phrases locale hint provided by the "lang" attribute of dom options
     * @protected
     */
    protected preparePhrases(data: IBitAppTranslationOptions, phrasesLocale?: string | null): IBitAppTranslationOptions
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
                data.phrases = {[phrasesLocale ?? data.locale!]: data.phrases};
            }
        } else {
            data.phrases = {};
        }
        
        return data;
    }
}