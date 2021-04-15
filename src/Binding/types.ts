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
 * Last modified: 2021.03.09 at 14:38
 */

import type {PlainObject} from '@labor-digital/helferlein';

export interface IPropertyAccessor<T = any>
{
    /**
     * The actual property of the bit class
     */
    readonly property: string;
    
    /**
     * The path in form of an array, to traverse the data of the bit.
     * The path always starts with the property
     */
    readonly path: Array<string>
    
    /**
     * Allows you direct access to the property
     */
    value: T;
}

export type TCssClass = string | PlainObject<string | null | boolean> | null
export type TCssStyle = string | CSSStyleDeclaration | PlainObject<string | null> | null;