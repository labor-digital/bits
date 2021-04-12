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
 * Last modified: 2021.04.12 at 17:36
 */

import type {PlainObject} from '@labor-digital/helferlein';

export interface IBitAppPluralizationRule
{
    (count: number): number
}

export interface IBitAppTranslationOptions
{
    /**
     * The language code we should use to lookup translations
     * If this value is omitted, bits will try to read it from the HTML tag.
     */
    lang?: string
    
    /**
     * The language code to use as a fallback if a certain label was not found for the selected language
     */
    fallbackLang?: string;
    
    /**
     * Allows you to provide the phrases for the translator.
     */
    phrases?: PlainObject
    
    /**
     * By default the app will load additional options from the DOM on script[data-bit-translation] tags,
     * to extend the options given when the app is created. If you set this to true, this feature can be disabled.
     */
    disableJsOptions?: boolean
    
    /**
     * A mapping of language code ids and their pluralization rules. The functions receive the "count" argument,
     * and should return the numeric index in the plural array, that should be used
     */
    pluralRules?: PlainObject<IBitAppPluralizationRule>
}

export interface ITranslateOptions
{
    /**
     * An enforced locale to use for this translation
     */
    lang?: string,
    
    /**
     * Used to determine which plural version to use
     */
    count?: number
}