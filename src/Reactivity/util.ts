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
 * Last modified: 2021.03.04 at 00:21
 *
 * To keep the look and feel similar to lit-element I reused the basic implementation of the change detection
 * and the attribute property converter in this package. The credit for some parts go to the lit-element authors.
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

import {isFunction, isString} from '@labor-digital/helferlein';
import type {
    IAttrToPropertyConverter,
    IChangeDetector,
    IPropertyConverter,
    IPropertyOptions,
    TAttrToPropertyConverter
} from './types';

export const defaultConverter: IPropertyConverter = {
    
    toAttribute(value: unknown, type?: unknown): unknown
    {
        switch (type) {
            case Boolean:
                return value ? '' : null;
            case Object:
            case Array:
                // if the value is `null` or `undefined` pass this through
                // to allow removing/no change behavior.
                return value == null ? value : JSON.stringify(value);
        }
        return value;
    },
    
    fromAttribute(value: string | null, type?: unknown)
    {
        switch (type) {
            case Boolean:
                return value !== null;
            case Number:
                return value === null ? null : Number(value);
            case Object:
            case Array:
                return JSON.parse(value!);
        }
        return value;
    }
    
};

export const defaultChangeDetector: IChangeDetector = (value: unknown, old: unknown): boolean => {
    // This ensures (old==NaN, value==NaN) always returns false
    return old !== value && (old === old || value === value);
};

export interface IMountAttrWatcher
{
    (attribute: string, mutation: MutationRecord): void
}

/**
 * Helper to create the mutation observer for the mount point. We need this,
 * because we can't use the observedAttributes() as it is a static method and we just simulate
 * a web-component class for our bits.
 *
 * @param mountEl
 * @param callback
 */
export function makeMountMutationObserver(mountEl: HTMLElement, callback: IMountAttrWatcher): MutationObserver
{
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type == 'attributes' && mutation.attributeName) {
                callback(mutation.attributeName, mutation);
            }
        });
    });
    
    observer.observe(mountEl, {
        attributes: true
    });
    
    return observer;
}

/**
 * Helper to read the value stored in an attribute and convert it into a javascript
 * representation of that data using the configured "converter" function.
 *
 * @param target The html element to read the attribute from
 * @param options The property options to extract the information about the property from
 */
export function readAttributeValue(target: HTMLElement, options: IPropertyOptions): any
{
    if (!isString(options.attribute)) {
        return undefined;
    }
    
    let converter: TAttrToPropertyConverter = options.converter ?? defaultConverter;
    
    if (!isFunction(converter) && isFunction(converter.fromAttribute)) {
        converter = converter.fromAttribute;
    }
    
    return (converter as IAttrToPropertyConverter)(
        target.getAttribute(options.attribute),
        options.type ?? String
    );
}