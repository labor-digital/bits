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
 * Last modified: 2021.03.04 at 00:13
 */

import {forEach, isFunction, isString, isUndefined, PlainObject} from '@labor-digital/helferlein';
import {
    autorun,
    IAutorunOptions,
    IReactionDisposer,
    IReactionOptions,
    IReactionPublic,
    makeObservable,
    observable,
    observe,
    reaction,
    runInAction
} from 'mobx';
import type {AbstractBit} from '../Core/AbstractBit';
import {setElementAttribute} from '../Core/Binding/util';
import type {BitDefinition} from '../Core/Definition/BitDefinition';
import {DefinitionRegistry} from '../Core/Definition/DefinitionRegistry';
import type {Mount} from '../Core/Mount/Mount';
import type {IPropertyWatcher} from '../Core/types';
import type {
    IAttrToPropertyConverter,
    IWatchOptions,
    TAttrToPropertyConverter,
    TPropertyToAttrConverter,
    TWatchTarget
} from './types';
import {
    defaultChangeDetector,
    defaultConverter,
    makeMountMutationObserver,
    readAttributeValue,
    valueComparer
} from './util';

export class Provider
{
    protected _mount?: Mount;
    protected _bit?: AbstractBit;
    protected _definition?: BitDefinition;
    protected _ignoreAttributeUpdateList: PlainObject = {};
    protected _disposers: Array<IReactionDisposer> = [];
    protected _observer?: MutationObserver;
    protected _metaDependencies?: PlainObject;
    
    /**
     * Used to bind the provider as a bridge between the given mount and the bit instance.
     *
     * This is a internal process that MUST be executed ONLY ONCE! Multiple binds on the same
     * bit will cause the universe to grind to a halt; and we don't want that to happen, right?
     *
     * @param mount The dom node of the bit mount
     * @param bit The instance of the bit class
     */
    public bind(mount: Mount, bit: AbstractBit): void
    {
        if (this._mount) {
            throw new Error('The reactivity provider was already bound, and can not be rebound!');
        }
        
        this._mount = mount;
        this._bit = bit;
        const def = this._definition = DefinitionRegistry.getDefinitionFor(Object.getPrototypeOf(bit));
        
        forEach(def.getProperties(), (options, property) => {
            if (isString(options.attribute) && this._mount!.el!.hasAttribute(options.attribute)) {
                // Load or initial state from the attribute
                this._bit![property] = readAttributeValue(this._mount!.el!, options);
            }
            
            if (isUndefined(this._bit![property])) {
                // Fallback to a default "null" if the property does not yet exist
                this._bit![property] = null;
            }
        });
        
        makeObservable(this._bit, def.getObservableAnnotations());
        
        // Create meta dependencies
        this._metaDependencies = makeObservable({
            dom: 0
        }, {
            dom: observable
        });
        
        forEach(def.getWatchers(), watcher => {
            if (isFunction(this._bit![watcher.method])) {
                this.addWatcher(watcher.target, function (...args: any) {
                    return bit[watcher.method].call(bit, ...args);
                });
            }
        });
        
        const disposer = observe(this._bit, change => {
            const property = change.name as string;
            if (!def.hasProperty(property)) {
                return;
            }
            
            const options = def.getProperty(property)!;
            const changeDetector = options!.changeDetector ?? defaultChangeDetector;
            const o = (change as any).oldValue;
            const n = (change as any).newValue;
            
            if (changeDetector(n, o)) {
                this.onPropertyUpdate(change.name as string, (change as any).newValue);
            }
        });
        this._disposers.push(disposer as any);
        
        if (def.getAttributes().length > 0) {
            this._observer = makeMountMutationObserver(
                this._mount.el!,
                this.onAttributeUpdate.bind(this),
                def.getAttributes()
            );
        }
    }
    
    /**
     * If used in a computed property or autorun handler, it will react to a "domChange" event
     * as if any other dependency had changed
     */
    public domChangeDependency(): void
    {
        // noinspection BadExpressionStatementJS
        this._metaDependencies && this._metaDependencies.dom;
    }
    
    /**
     * Executed when the mount received a "domChange" event, and updates our internal dependencies
     * to force a recalculation on autoRun or computed properties that use $find()
     */
    public reactToDomChanged(): void
    {
        if (this._metaDependencies) {
            runInAction(() => this._metaDependencies!.dom++);
        }
    }
    
    /**
     * Executes all registered static autorun methods that have been decorated using @Autorun
     */
    public executeStaticAutoRun(): void
    {
        const def = this._definition;
        if (!def || !this._bit) {
            return;
        }
        
        forEach(def.getAutoRunMethods(), (options, method) => {
            if (isFunction(this._bit![method])) {
                this.addAutoRun((reaction) => {
                    this._bit![method](reaction);
                }, options);
            }
        });
    }
    
    /**
     * Registers a new auto-runner for this bit, and automatically adds it to the garbage collection
     * @see https://mobx.js.org/reactions.html#autorun
     *
     * @param watcher The function to execute, when one or more of the used observables changed
     * @param options Additional options
     */
    public addAutoRun(watcher: (r: IReactionPublic) => any, options?: IAutorunOptions): IReactionDisposer
    {
        const disposer = autorun(watcher, options ?? {});
        this._disposers.push(disposer);
        return disposer;
    }
    
    /**
     * Registers a new watcher for a property or another observable inside the bit
     * @see https://mobx.js.org/reactions.html#reaction
     *
     * @param target Either the name of a property to watch, or a closure to define the reactive data
     * @param watcher The watcher to execute when a change occurred
     * @param options Additional options that define how the watcher is executed
     */
    public addWatcher(target: TWatchTarget, watcher: IPropertyWatcher, options?: IWatchOptions): IReactionDisposer
    {
        const bit = this._bit!;
        
        if (isString(target)) {
            const targetString = target;
            target = function watchTargetResolver() {
                return bit[targetString];
            };
        }
        
        options = options ?? {};
        
        const reactionOptions: IReactionOptions = {
            fireImmediately: options.immediately,
            equals: (options.equals ?? valueComparer).bind(bit)
        };
        
        const disposer = reaction(
            function watchTargetThisWrapper(...args) {
                return (target as any).call(bit, ...args);
            },
            watcher,
            reactionOptions
        );
        this._disposers.push(disposer);
        return disposer;
    }
    
    /**
     * Destroys this provider by unbinding all references
     */
    public destroy(): void
    {
        if (this._observer) {
            this._observer.disconnect();
        }
        
        forEach(this._disposers, disposer => disposer());
        delete this._bit;
        delete this._mount;
        delete this._definition;
        delete this._observer;
        this._disposers = null as any;
        this._ignoreAttributeUpdateList = null as any;
    }
    
    /**
     * Emitted every time a observable property was changed and handles the reflection
     * of the data back to the dom if configured using the "reflect" option.
     *
     * @param property
     * @param value
     * @protected
     */
    protected onPropertyUpdate(property: string, value: any): void
    {
        if (!this._definition) {
            return;
        }
        
        const options = this._definition.getProperty(property);
        
        if (!options || !options.reflect || !isString(options.attribute)) {
            return;
        }
        
        let converter: TPropertyToAttrConverter | TAttrToPropertyConverter = options.converter ?? defaultConverter;
        
        if (isFunction(converter)) {
            converter = defaultConverter.toAttribute!;
        } else if (isFunction(converter.toAttribute)) {
            converter = converter.toAttribute;
        }
        
        value = (converter as IAttrToPropertyConverter)(value, options.type ?? String);
        
        this._ignoreAttributeUpdateList[options.attribute] = true;
        setElementAttribute(this._mount!.el!, options.attribute, value, true);
    }
    
    /**
     * Internal helper to handle the update on a specific DOM attribute.
     * It checks if the attribute is watched and will read the value into javascript if required.
     * @param attribute
     * @protected
     */
    protected onAttributeUpdate(attribute: string)
    {
        if (this._ignoreAttributeUpdateList[attribute]) {
            delete this._ignoreAttributeUpdateList[attribute];
            return;
        }
        
        if (!this._definition || !this._definition.hasAttribute(attribute)) {
            return;
        }
        
        const property = this._definition.getPropertyNameForAttribute(attribute);
        const options = this._definition.getProperty(property);
        
        this._bit![property] = readAttributeValue(this._mount!.el!, options ?? {});
    }
}