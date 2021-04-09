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

import {isString, PlainObject} from '@labor-digital/helferlein';
import * as translate from 'translate-js';
import {Translator} from '../Tool/Translator';
import type {IBitAppTranslationConfigurator, IBitAppTranslationOptions} from './types';

export class TranslatorProvider
{
    /**
     * The iso 2-char locale to use for the translator
     * @protected
     */
    protected _locale: string;
    
    /**
     * The globally registered phrases for the translator
     * @protected
     */
    protected _phrases: PlainObject;
    
    /**
     * An optional configurator callback to set low-level options to the translate-js implementation
     * @protected
     */
    protected _configurator?: IBitAppTranslationConfigurator;
    
    /**
     * The translator instance to use on all bits that don't provide their own phrases or locale
     * @protected
     */
    protected _defaultTranslator?: Translator;
    
    constructor(options?: IBitAppTranslationOptions)
    {
        options = options ?? {};
        this._locale = this.ensureLocale(options.locale);
        this._phrases = options.phrases ?? {};
    }
    
    /**
     * Public factory to require a translator instance for a single bit.
     * If bitLocale and bitPhrases are empty a shared, global translator object will be returned.
     *
     * @param bitLocale The locale string that was provided using bt-locale
     * @param bitPhrases The phrases object that was provided using bt-phrases
     */
    public requireTranslator(bitLocale?: string, bitPhrases?: PlainObject): Translator
    {
        // If nothing special is configured just use the default translator
        if (!bitLocale && !bitPhrases) {
            if (this._defaultTranslator) {
                return this._defaultTranslator;
            }
            return this._defaultTranslator = this.translatorFactory();
        }
        
        return this.translatorFactory(bitLocale, bitPhrases);
    }
    
    /**
     * Internal factory to actually create a new translator instance
     * @param bitLocale
     * @param bitPhrases
     * @protected
     */
    protected translatorFactory(bitLocale?: string, bitPhrases?: PlainObject): Translator
    {
        const rawTranslator = translate.createRegistry();
        const locale = this.ensureLocale(bitLocale);
        
        rawTranslator.whenUndefined = (key, locale) => {
            console.warn('Missing translation for key: "' + key + '" in locale: "' + locale + '"');
            return key;
        };
        
        rawTranslator.setLocale(locale);
        rawTranslator.add(this._phrases, locale);
        
        if (bitPhrases) {
            rawTranslator.add(bitPhrases, locale);
        }
        
        return new Translator(rawTranslator);
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
}