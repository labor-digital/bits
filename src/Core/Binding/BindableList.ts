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
 * Last modified: 2021.08.28 at 16:03
 */

import {forEach, inflectToCamelBack, inflectToDashed, PlainObject} from '@labor-digital/helferlein';
import type {IBindableConfig, IBindableCtor} from './types';

export class BindableList
{
    protected _configList: PlainObject<IBindableConfig> = {};
    
    constructor(definition: PlainObject<IBindableCtor>)
    {
        forEach(definition, (ctor, key) => {
            this._configList[key] = {
                key,
                ctor,
                selector: '*[data-' + inflectToDashed(key) + ']',
                dataKey: inflectToCamelBack(key)
            };
        });
    }
    
    /**
     * Returns a single bindable configuration
     * @param key
     */
    public get(key: string): IBindableConfig | undefined
    {
        return this._configList[key] ?? undefined;
    }
    
    /**
     * Executes the given callback for each bindable in the configuration list
     * @param callback
     */
    public forEach(callback: (config: IBindableConfig) => void | false): void
    {
        forEach(this._configList, callback);
    }
}