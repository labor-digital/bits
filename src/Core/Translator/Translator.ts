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

import {isArray, isPlainObject, PlainObject} from '@labor-digital/helferlein';
import type {TranslatorContext} from './TranslatorContext';
import type {IBitAppPluralizationRule, ITranslateOptions} from './types';

export class Translator
{
    protected _lang: string;
    protected _context: TranslatorContext;
    
    constructor(lang: string, context: TranslatorContext)
    {
        this._lang = lang;
        this._context = context;
    }
    
    /**
     * Returns the current language code (iso code) that is configured for this bit
     */
    public get lang(): string
    {
        return this._lang;
    }
    
    /**
     * Returns the language code (iso two char code) that is configured for this bit
     */
    public get langShort(): string
    {
        return this.lang.substr(0, 2).toLowerCase();
    }
    
    /**
     * Returns the configured fallback language code
     */
    public get fallbackLang(): string
    {
        return this._context.fallbackLang;
    }
    
    /**
     * Translates a single key using the loaded labels and returns the matched value.
     * @param key The label key to use for translation
     * @param args An array of arguments to replace using sprintf in your label
     * @param options Advanced translation options
     */
    public translate(
        key: string,
        args?: Array<string | number> | PlainObject<string | number>,
        options?: ITranslateOptions
    ): string
    {
        options = options ?? {};
        const lang = options.lang ?? this._lang;
        let labels = this._context.getPhrasesFor(lang);
        
        if (!labels || !labels[key]) {
            labels = this._context.getPhrasesFor(this.fallbackLang);
        }
        
        if (!labels || !labels[key]) {
            console.warn('Missing translation for key: "' + key + '" in language: "' + lang + '"');
            return key;
        }
        
        const argsIsObject = isPlainObject(args);
        let label = labels[key];
        
        if (isArray(label)) {
            const count = options.count ?? (argsIsObject ? (args as any).count : 1);
            const index = this._context.getPluralIndex(lang, count);
            if (!label[index]) {
                console.warn(
                    'Missing pluralization index ' + index + ' for key: "' + key + '" in language: "' + lang + '"');
                label = label[0] ?? key;
            } else {
                label = label[index];
            }
            
            if (!argsIsObject) {
                label = this.replaceMarker(label, {count});
            }
        }
        
        if (args) {
            if (isArray(args)) {
                label = this.sprintf(label, args);
            } else if (argsIsObject) {
                label = this.replaceMarker(label, args);
            }
        }
        
        return label;
    }
    
    /**
     * Allows you to add additional phrases for a certain language.
     * Note: This affects ALL bit instances of this app!
     * @param lang The language code to add the phrases to
     * @param phrases The phrases to add
     */
    public addPhrases(lang: string, phrases: PlainObject): this
    {
        this._context.addPhrases(lang, phrases);
        
        return this;
    }
    
    /**
     * Allows you to set a new plural rule to apply for a certain language.
     * Note: This affects ALL bit instances of this app!
     * @param lang The language code to set the pluralization rule for
     * @param rule The rule to select the correct translation index with
     */
    public addPluralRule(lang: string, rule: IBitAppPluralizationRule): this
    {
        this._context.addPluralRule(lang, rule);
        
        return this;
    }
    
    /**
     * Internal helper to perform a sprintf equivalent. %s and %d are supported.
     *
     * @param value The text to replace the arguments in
     * @param args The list of arguments to apply into the placeholders
     * @protected
     * @see https://www.php.net/manual/en/function.sprintf.php
     */
    protected sprintf(value: string, args: Array<string | number>): string
    {
        let i = 0;
        return value.replace(/%([ds])/g, (a, b) => {
            if (args.length - 1 < i) {
                return a;
            }
            
            const v = b === 'd' ? parseInt(args[i] + '') + '' : args[i] + '';
            i++;
            return v;
        });
    }
    
    /**
     * Internal helper to replace markers with their matching value
     * @param value The text to replace the arguments in
     * @param args The argument object to replace on the value
     * @protected
     */
    protected replaceMarker(value: string, args: PlainObject<string | number>): string
    {
        return value.replace(/{{\s*(\w+)\s*}}/g, function (match, param: string) {
            return args[param] as string ?? match;
        });
    }
}