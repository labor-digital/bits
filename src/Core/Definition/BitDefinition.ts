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
 * Last modified: 2021.03.14 at 17:25
 */

import {
    cloneList,
    forEach,
    getListKeys,
    inflectToDashed,
    isString,
    isUndefined,
    merge
} from '@labor-digital/helferlein';
import type {IPropertyOptions} from '../../Reactivity/types';
import {elementFinder} from '../util';
import type {
    IListenerSelectorProvider,
    TBitAnnotations,
    TBitAttributeMap,
    TBitListeners,
    TBitPropertyOptionMap
} from './types';
import {extractComputedProperties, injectPropertyAnnotations, makeObservableAnnotationsFor} from './util';

export class BitDefinition
{
    protected _properties: TBitPropertyOptionMap;
    protected _attributeMap: TBitAttributeMap;
    protected _annotations: TBitAnnotations;
    protected _listeners: TBitListeners;
    protected _computed: Array<string>;
    
    constructor(proto: any)
    {
        this._properties = new Map();
        this._attributeMap = new Map();
        this._annotations = proto === null ? {} : makeObservableAnnotationsFor(proto);
        this._computed = extractComputedProperties(this._annotations);
        this._listeners = new Set();
    }
    
    /**
     * Registers a new property option entry
     *
     * @param property
     * @param options
     */
    public addProperty(property: string, options?: IPropertyOptions): void
    {
        // Generate the attribute and extend the options if required
        options = options ?? {};
        const attr = options.attribute === true || isUndefined(options.attribute)
            ? inflectToDashed(property) : options.attribute;
        options = {...options, attribute: attr};
        
        // Inject the attribute into the map for the prototype
        if (isString(attr)) {
            this._attributeMap.set(attr, property);
        }
        
        // Inject the options into the storage
        this._properties.set(property, options);
    }
    
    /**
     * Returns true if the given property exists, false if not
     * @param property
     */
    public hasProperty(property: string): boolean
    {
        return this._properties.has(property);
    }
    
    /**
     * Returns true if the given property is registered as a computed property
     * @param property
     */
    public hasComputed(property: string): boolean
    {
        return this._computed.indexOf(property) !== -1;
    }
    
    /**
     * Returns the registered options for the given property name or undefined if there are none.
     * @param property
     */
    public getProperty(property: string): IPropertyOptions | undefined
    {
        return this._properties.get(property);
    }
    
    /**
     * Returns all registered property options
     */
    public getProperties(): TBitPropertyOptionMap
    {
        return this._properties;
    }
    
    /**
     * Returns the list of all property names
     * NOTE: This will include the names of computed properties
     */
    public getPropertyNames(): Array<string>
    {
        return [...getListKeys(this._properties), ...this._computed];
    }
    
    /**
     * Returns true if the given attribute was registered, false if not
     * @param attribute
     */
    public hasAttribute(attribute: string): boolean
    {
        return this._attributeMap.has(attribute);
    }
    
    /**
     * Returns the name of the property name for the required attribute name
     * @param attribute
     */
    public getPropertyNameForAttribute(attribute: string): string
    {
        return this._attributeMap.get(attribute) ?? attribute;
    }
    
    /**
     * Returns the list of all known attribute names
     */
    public getAttributes(): Array<string>
    {
        return getListKeys(this._attributeMap);
    }
    
    /**
     * Registers a new static event listener
     * @param method The name of the method on the bit class that should be used as listener handler
     * @param selector The element selector to bind the events on
     * @param event The name of the event/list of events to bind the listener to
     * @param deep Only used if $selector is a string -> Will determine if the elements are resolved "deep" or only inside the boundaries
     */
    public addEventListener(
        method: string,
        selector: string | IListenerSelectorProvider | undefined,
        event: string | Array<string>,
        deep?: boolean
    ): void
    {
        let provider = selector;
        if (isUndefined(provider)) {
            provider = function () { return this.$el; };
        } else if (isString(provider)) {
            provider = function () { return elementFinder(this.$el, provider as string, true, deep); };
        }
        
        this._listeners.add({
            provider,
            events: isString(event) ? [event] : event,
            method: method
        });
    }
    
    /**
     * Returns the list of all statically bound event listeners
     */
    public getEventListeners(): TBitListeners
    {
        return this._listeners;
    }
    
    /**
     * Returns the list of all generated observable annotations
     */
    public getObservableAnnotations(): TBitAnnotations
    {
        return injectPropertyAnnotations(this._annotations, this._properties);
    }
    
    /**
     * Merges the given definition into this definition and returns a new definition
     * where both definitions are combined. The given definition is always used as "parent" meaning,
     * this definition will win over the given one.
     *
     * @param foreign
     */
    public mergeWith(foreign: BitDefinition): BitDefinition
    {
        const n = new BitDefinition(null);
        
        n._computed = [...this._computed, ...foreign._computed].filter(
            (v, i, self) =>
                self.indexOf(v) === i
        );
        
        n._properties = new Map(this._properties);
        forEach(foreign._properties, (options, key) => {
            n._properties.set(key, merge(options, this._properties.get(key) ?? {}) as any);
        });
        
        n._attributeMap = new Map(this._attributeMap);
        forEach(foreign._attributeMap, (property, key) => {
            if (n._properties.has(property) && n._properties.get(property)!.attribute !== false) {
                n._attributeMap.set(key, property);
            }
        });
        
        n._annotations = merge(foreign._annotations, cloneList(this._annotations)) as any;
        
        n._listeners = new Set(this._listeners);
        forEach(foreign._listeners, listener => n._listeners.add(listener));
        
        return n;
    }
}