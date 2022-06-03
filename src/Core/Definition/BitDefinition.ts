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
import type {IAutorunOptions} from 'mobx';
import type {IPropertyOptions, IWatchOptions, TWatchTarget} from '../../Reactivity/types';
import {defaultChangeDetector} from '../../Reactivity/util';
import type {TEventList, TEventTarget} from '../types';
import type {
    TBitAnnotations,
    TBitAttributeMap,
    TBitAutoRunMap,
    TBitListeners,
    TBitNonObservable,
    TBitPropertyOptionMap,
    TBitWatchers
} from './types';
import {extractComputedProperties, makeObservableAnnotationsFor, prepareObservableAnnotations} from './util';

export class BitDefinition
{
    protected _properties: TBitPropertyOptionMap;
    protected _attributeMap: TBitAttributeMap;
    protected _annotations: TBitAnnotations;
    protected _listeners: TBitListeners;
    protected _watchers: TBitWatchers;
    protected _computed: Array<string>;
    protected _autoRun: TBitAutoRunMap;
    protected _nonObservable: TBitNonObservable;
    
    constructor(proto: any)
    {
        this._properties = new Map();
        this._attributeMap = new Map();
        this._annotations = proto === null ? {} : makeObservableAnnotationsFor(proto);
        this._computed = extractComputedProperties(this._annotations);
        this._listeners = new Set();
        this._watchers = new Set();
        this._autoRun = new Map();
        this._nonObservable = new Set();
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
        
        options = {
            ...options,
            changeDetector: options.changeDetector ?? defaultChangeDetector,
            attribute: attr
        };
        
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
     * @param target The element selector to bind the events on
     * @param events The name of the event/list of events to bind the listener to
     * @param deep Only used if $selector is a string -> Will determine if the elements are resolved "deep" or only inside the boundaries
     */
    public addEventListener(
        method: string,
        target: TEventTarget | undefined,
        events: TEventList,
        deep?: boolean
    ): void
    {
        this._listeners.add({target, deep, events, method});
    }
    
    /**
     * Returns the list of all statically bound event listeners
     */
    public getEventListeners(): TBitListeners
    {
        return this._listeners;
    }
    
    /**
     * Adds a new static watcher to the definition
     * @param method The name of the method that should be added as watcher
     * @param target The target or target provider to watch
     * @param options Additional options that define how the watcher is executed
     */
    public addWatcher(method: string, target: TWatchTarget, options?: IWatchOptions): void
    {
        this._watchers.add({target, method, options});
    }
    
    /**
     * Returns the list of all registered watchers
     */
    public getWatchers(): TBitWatchers
    {
        return this._watchers;
    }
    
    /**
     * Adds the given method as "autorun" for the instance
     * @param method
     * @param options
     */
    public addAutoRun(method: string, options?: IAutorunOptions): void
    {
        this._autoRun.set(method, options);
        this._nonObservable.add(method);
    }
    
    /**
     * Returns all methods that have been annotated using the @AutoRun decorator
     */
    public getAutoRunMethods(): TBitAutoRunMap
    {
        return this._autoRun;
    }
    
    /**
     * Adds a new method name that should not be wrapped in an mobx action when being executed.
     * Basically it terns the method invisible for mobx
     * @param method
     */
    public addNonObservable(method: string): void
    {
        this._nonObservable.add(method);
    }
    
    /**
     * Returns the list of all generated observable annotations
     */
    public getObservableAnnotations(): TBitAnnotations
    {
        return prepareObservableAnnotations(this._annotations, this._properties, this._nonObservable);
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
        n._listeners = merge(this._listeners, foreign._listeners) as any;
        n._watchers = merge(this._watchers, foreign._watchers) as any;
        n._autoRun = merge(this._autoRun, foreign._autoRun) as any;
        
        return n;
    }
}