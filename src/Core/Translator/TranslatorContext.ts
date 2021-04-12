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
 * Last modified: 2021.04.12 at 17:50
 */

import type {PlainObject} from '@labor-digital/helferlein';
import {forEach, isPlainObject} from '@labor-digital/helferlein';
import type {IBitAppPluralizationRule} from './types';

/**
 * @hidden
 */
export class TranslatorContext
{
    protected _lang: string;
    protected _fallbackLang: string;
    protected _phrases: PlainObject = {};
    protected _pluralRules: PlainObject<IBitAppPluralizationRule> = {};
    protected _cache: PlainObject<PlainObject<string>> = {};
    
    constructor(lang: string, fallbackLang: string)
    {
        this._lang = lang;
        this._fallbackLang = fallbackLang;
    }
    
    /**
     * Returns the globally configured language code
     */
    public get lang(): string
    {
        return this._lang;
    }
    
    /**
     * Returns the configured fallback language code
     */
    public get fallbackLang(): string
    {
        return this._fallbackLang;
    }
    
    /**
     * Allows you to add additional phrases for a certain language.
     * @param lang The language code to add the phrases to
     * @param phrases The phrases to add
     */
    public addPhrases(lang: string, phrases: PlainObject): void
    {
        if (!this._phrases[lang]) {
            this._phrases[lang] = {};
        }
        
        const list = this._phrases[lang];
        
        const flattener = function (v: PlainObject, path: string) {
            forEach(v, function (_v, _k) {
                if (isPlainObject(_v)) {
                    flattener(_v, path === '' ? _k + '.' : path + '.' + _k + '.');
                    return;
                }
                
                list[path + _k] = _v;
            });
        };
        
        flattener(phrases, '');
        this._cache = {};
    }
    
    /**
     * Allows you to set a new plural rule to apply for a certain language
     * @param lang The language code to set the pluralization rule for
     * @param rule The rule to select the correct translation index with
     */
    public addPluralRule(lang: string, rule: IBitAppPluralizationRule): void
    {
        this._pluralRules[lang] = rule;
        this._cache = {};
    }
    
    /**
     * Returns the list of phrases for a certain language. This will try to shorten the language code
     * if a specific one was not found. Meaning "en-US" gets "en" if "en-US" was not registered
     * @param lang The language code to find the phrases for
     */
    public getPhrasesFor(lang: string): PlainObject
    {
        let _lang = this.getListKey(this._phrases, lang, 'phrase');
        return _lang ? this._phrases[_lang] : {};
    }
    
    /**
     * Returns the plural array index based on the given counting number and the language id. This will try
     * to shorten the language code if a specific one was not found. Meaning "en-US" gets "en" if "en-US" was not registered.
     * If there is no plural rule, the default rule will die applied, which is: (count === 1) ? 0 : 1
     * @param lang The language code to retrieve the index for
     * @param count The count to calculate the index for
     */
    public getPluralIndex(lang: string, count: number): number
    {
        const _lang = this.getListKey(this._pluralRules, lang, 'plural');
        return _lang ? this._pluralRules[_lang](count) : (count === 1) ? 0 : 1;
    }
    
    /**
     * Internal helper to look up a language code inside a list of language aware entries.
     *
     * @param list
     * @param lang
     * @param ident
     * @protected
     */
    protected getListKey(list: PlainObject, lang: string, ident: string): string | undefined
    {
        if (!this._cache[ident]) {
            this._cache[ident] = {};
        }
        
        const cache = this._cache[ident];
        
        if (cache[lang] ?? false) {
            return cache[lang];
        }
        
        if (list[lang]) {
            return cache[lang] = lang;
        }
        
        const _lang = lang.substr(0, 2).toLowerCase();
        
        if (list[_lang]) {
            return cache[lang] = _lang;
        }
        
        return undefined;
    }
}