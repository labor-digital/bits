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
 * Last modified: 2021.06.30 at 13:05
 */
import {closest, getPath, isObject, setPath} from '@labor-digital/helferlein';
import {runInAction} from 'mobx';
import type {AbstractBit} from '../AbstractBit';
import type {IPropertyAccessor} from './types';

/**
 * Helper to create a property access helper that works on properties and paths as well.
 * This means you can either access "myProperty" or "myProperty.data.child.something", without worrying about
 * implementing path getters and setters
 *
 * @param bit The bit to access the data for
 * @param property The name of the property/path of data inside a property to work with
 * @param properties A list of valid property names that can be accessed on the bit
 * @param typeHint type hint that was provided for the property
 */
export function getPropertyAccessor<T = any>(
    bit: AbstractBit,
    property: string,
    properties: Array<string>,
    typeHint?: unknown
): Promise<IPropertyAccessor<T> | null>
{
    const path = property.split('.');
    const propertyName = path[0];
    const isPath = property !== propertyName;
    
    if (properties.indexOf(propertyName) === -1) {
        // Handling of context data bindings
        if (isPath && propertyName.indexOf('@') === 0) {
            const context = propertyName.substring(1);
            const contextMount: any = closest(bit.$context.di.app.mountTag + '[context=' + context + ']', bit.$el);
            
            if (contextMount === null) {
                console.error(
                    'Can\'t bind data for context: "' + context
                    + '", because the context is not a parent of this element!');
                return Promise.resolve(null);
            }
            
            if (!isObject(contextMount.bit)) {
                console.error(
                    'Mount for context: "' + context + '", was resolved, but does not look like a valid bit mount!');
                return Promise.resolve(null);
            }
            
            return contextMount.bit.$context.binder.getAccessor(path.slice(1).join('.'));
        }
        
        console.error('Can\'t bind data on unknown property: "' + propertyName + '" of element:', bit.$el,
            'allowed properties:', properties);
        
        return Promise.resolve(null);
    }
    
    return Promise.resolve(
        {
            property: propertyName,
            path,
            typeHint,
            get(): T
            {
                return isPath ? getPath(bit as any, path, null) : bit[property] ?? null;
            },
            set(v)
            {
                runInAction(() => {
                    if (isPath) {
                        setPath(bit, path, v);
                    } else {
                        bit[property] = v;
                    }
                });
            }
        }
    );
    
}