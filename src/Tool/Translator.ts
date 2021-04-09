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
 * Last modified: 2021.03.01 at 22:47
 */

import {isArray, isEmpty, PlainObject} from '@labor-digital/helferlein';
import type {TLowLevelTranslator} from '../Core/types';

export class Translator
{
    protected _concreteTranslator: TLowLevelTranslator;
    
    constructor(concreteTranslator: TLowLevelTranslator)
    {
        this._concreteTranslator = concreteTranslator;
    }
    
    /**
     * Returns the current locale string (iso two char code) that is configured for this bit
     */
    public get locale(): string
    {
        return this._concreteTranslator.getLocale() ?? 'en';
    }
    
    /**
     * Translates a single key using the loaded labels and returns the matched value.
     * @param key The label key to use for translation
     * @param args An array of arguments to replace using sprintf in your label
     */
    public translate(key: string, args?: Array<string | number> | PlainObject<string>): string
    {
        if (!isEmpty(args) && isArray(args)) {
            return this.sprintf(this._concreteTranslator(key), args);
        } else {
            return this._concreteTranslator(key, args);
        }
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
}