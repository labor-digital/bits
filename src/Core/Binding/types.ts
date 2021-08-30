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
 * Last modified: 2021.08.28 at 15:16
 */


import type {PlainObject} from '@labor-digital/helferlein';
import type {AbstractBindable} from './Bindable/AbstractBindable';
import type {BinderContext} from './BinderContext';
import type {AbstractDirective} from './Directive/AbstractDirective';

export interface IBindableCtor
{
    new(el: HTMLElement, context: BinderContext): AbstractBindable;
}

export interface IBindableConfig
{
    key: string;
    ctor: IBindableCtor;
    selector: string;
    dataKey: string;
}

export interface IDirectiveCtor
{
    new(el: HTMLElement, context: BinderContext): AbstractDirective | AbstractBindable;
}

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
    readonly path: Array<string>;
    
    /**
     * Sets the value of the property to the given value
     * @param value
     */
    set(value: T): void;
    
    /**
     * Retrieves the value of the property
     */
    get(): T;
}

export type TCssClass = string | PlainObject<string | null | boolean> | null
export type TCssStyle = string | CSSStyleDeclaration | PlainObject<string | null> | null;