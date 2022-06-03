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
 * Last modified: 2021.03.04 at 00:16
 *
 * To keep the look and feel similar to lit-element I tried to mirror all options in the bit implementation.
 * Therefore I re-used most of the option definition interfaces directly out of that library.
 * https://github.com/Polymer/lit-element/blob/master/src/lib/updating-element.ts
 *
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import type {IEqualsComparer, IReactionPublic} from 'mobx';
import type {AbstractBit} from '../Core/AbstractBit';

export type TWatchTarget = string | ((this: AbstractBit | any, r: IReactionPublic) => any);

export interface IWatchOptions
{
    immediately?: boolean,
    equals?: IEqualsComparer<any>
}

export interface IPropertyToAttrConverter<Type = unknown, TypeHint = unknown>
{
    (value: Type, type: TypeHint): unknown;
}

export interface IAttrToPropertyConverter<Type = unknown, TypeHint = unknown>
{
    (value: string | null, type?: TypeHint): Type;
}

/**
 * Converts property values to and from attribute values.
 */
export interface IPropertyConverter<Type = unknown, TypeHint = unknown>
{
    /**
     * Function called to convert an attribute value to a property
     * value.
     */
    fromAttribute?: IAttrToPropertyConverter<Type, TypeHint>;
    
    /**
     * Function called to convert a property value to an attribute
     * value.
     *
     * It returns unknown instead of string, to be compatible with
     * https://github.com/WICG/trusted-types (and similar efforts).
     */
    toAttribute?: IPropertyToAttrConverter<Type, TypeHint>;
}

export type TAttrToPropertyConverter = IPropertyConverter | IAttrToPropertyConverter;
export type TPropertyToAttrConverter = IPropertyConverter | IPropertyToAttrConverter;

/**
 * Helper to detect if a value should be considered changed.
 */
export interface IChangeDetector<Type = unknown>
{
    (value: Type, old: Type): boolean;
}

/**
 * Options for a private, reactive data field inside the element
 */
export interface IDataPropertyOptions<Type = unknown, TypeHint = unknown>
{
    /**
     * A function that indicates if a property should be considered changed when
     * it is set. The function should take the `newValue` and `oldValue` and
     * return `true` if an update should be requested.
     */
    readonly changeDetector?: IChangeDetector<Type>;
    
    /**
     * Indicates the type of the property. This is used only as a hint for the
     * `converter` to determine how to convert the value to/from a value field when used in a "model".
     *
     * Currently, only "Date" has a special function as it allows the setting and reading of Date
     * values on date fields
     */
    readonly type?: TypeHint;
}

/**
 * Options for a reactive property
 */
export interface IPropertyOptions<Type = unknown, TypeHint = unknown> extends IDataPropertyOptions<Type>
{
    /**
     * Indicates how and whether the property becomes an observed attribute.
     * 1. By default, the attribute will be a dashed version of the property name, meaning
     * "fooBar" becomes "foo-bar".
     * 2. If you set this option to "false" the property is only used internally and not be linked
     * to a dom attribute.
     * 3. If a string is set, the attribute with the matching name will be observed (e.g`attribute: 'foo-bar'`).
     */
    readonly attribute?: boolean | string;
    
    /**
     * Indicates the type of the property. This is used only as a hint for the
     * `converter` to determine how to convert the attribute
     * to/from a property.
     */
    readonly type?: TypeHint;
    
    /**
     * Indicates how to convert the attribute to/from a property. If this value
     * is a function, it is used to convert the attribute value to the property
     * value. If it's an object, it can have keys for `fromAttribute` and
     * `toAttribute`. If no `toAttribute` function is provided and
     * `reflect` is set to `true`, the property value is set directly to the
     * attribute. A default `converter` is used if none is provided; it supports
     * `Boolean`, `String`, `Number`, `Date`, `Object`, and `Array`. Note,
     * when a property changes and the converter is used to update the attribute,
     * the property is never updated again as a result of the attribute changing,
     * and vice versa.
     */
    readonly converter?: TAttrToPropertyConverter;
    
    /**
     * Indicates if the property should reflect to an attribute.
     * If `true`, when the property is set, the attribute is set using the
     * attribute name determined according to the rules for the `attribute`
     * property option and the value of the property converted using the rules
     * from the `converter` property option.
     */
    readonly reflect?: boolean;
}