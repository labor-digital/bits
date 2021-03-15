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
 * Last modified: 2021.03.05 at 13:39
 */

import {ComponentProxy, emitDomEvent, forEach, isNumber} from '@labor-digital/helferlein';
import {autorun, IReactionDisposer} from 'mobx';
import type {AbstractBit} from '../Core/AbstractBit';
import type {BitDefinition} from '../Core/Definition/BitDefinition';
import {DefinitionRegistry} from '../Core/Definition/DefinitionRegistry';
import type {Mount} from '../Core/Mount/Mount';
import {getPropertyAccessor} from './propertyAccess';
import type {IPropertyAccessor} from './types';
import {getElementValue, setElementAttribute, setElementContent, setElementValue, splitMapString} from './util';

export class Binder
{
    protected _mount?: Mount;
    protected _bit?: AbstractBit;
    protected _definition?: BitDefinition;
    protected _disposers: Array<IReactionDisposer> = [];
    protected _accessors: Map<string, IPropertyAccessor> = new Map();
    
    protected _delayedActions?: Set<Function> = new Set();
    protected _foreignModelBinders: Map<string, Function> = new Map();
    
    /**
     * We use our own proxy in the binder, so we don't conflict with any listeners
     * that have been set by the component author
     * @protected
     */
    protected _proxy?: ComponentProxy;
    
    /**
     * Used to bind this instance as a glue layer between the DOM nodes and the reactive data
     * of the given bit. It will also bind statically declared event listeners (used by the decorator)
     * to the DOM
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
            throw new Error('The binding provider was already bound, and can not be rebound!');
        }
        
        this._mount = mount;
        this._bit = bit;
        this._definition = DefinitionRegistry.getDefinitionFor(Object.getPrototypeOf(bit));
        
        this._proxy = new ComponentProxy(bit);
        
        // Bind foreign models to our children
        forEach(this._delayedActions!, a => a());
        delete this._delayedActions;
        
        this.refresh();
    }
    
    /**
     * Allows you to recreate all bindings on the dom, both for the data and static event listeners
     */
    public refresh(): void
    {
        if (!this._mount) {
            return;
        }
        
        // Reset all our current bindings
        this.unbindWatchers();
        this._proxy!.unbindAll();
        this._accessors = new Map();
        
        // Rebind everything
        this.bindEventListeners();
        this.bindData();
        forEach(this._foreignModelBinders, binder => binder());
    }
    
    /**
     * Allows you to create a new property accessor for the linked bit.
     * All accessors are cached and therefore don't bloat the memory.
     *
     * @param property
     * @see getPropertyAccessor for further details
     */
    public getAccessor(property: string): IPropertyAccessor | null
    {
        if (!this._bit) {
            return null;
        }
        
        if (!this._accessors.has(property)) {
            const accessor = getPropertyAccessor(this._bit, property, this._definition!.getPropertyNames());
            
            if (accessor === null) {
                return null;
            }
            
            this._accessors.set(property, accessor);
        }
        
        return this._accessors.get(property) ?? null;
    }
    
    /**
     * Internal helper to find all data bindings and create the glue for the given specification
     * @protected
     */
    protected bindData(): void
    {
        const selector = // OneWay: Escaped data binding
            '*[data-bind],'
            // OneWay: Unescaped data binding
            + '*[data-bind-html],'
            // OneWay: Attribute binding
            + '*[data-bind-attr],'
            // TwoWay: Model binding on elements
            + '*[data-model]';
        
        forEach(this._bit!.$find(selector, true), target => {
            // OneWay: Escaped data binding
            this.bindOneWayContent(target, false);
            // OneWay: Unescaped data binding
            this.bindOneWayContent(target, true);
            // OneWay: Attribute binding
            this.bindOneWayAttributes(target);
            // TwoWay: Model binding on elements
            this.bindTwoWayValue(target);
        });
    }
    
    /**
     * Internal API that allows bits to perform the data-binding between two bit-mount elements.
     *
     * @param property the name of the local property to set
     * @param value The value to set for the property
     * @param forModel If set to TRUE the method will automatically set up for a two-way data binding
     * between bit-mounts. If set to FALSE properties that are not part of the bits api, automatically
     * fall back to html attributes.
     */
    public setForeignProperty(property: string, value: any, forModel: boolean): void
    {
        this.callOrDelay(() => {
            const prop = this.getAccessor(property);
            
            if (prop === null) {
                if (!forModel) {
                    setElementAttribute(this._mount!.el!, property, value, true);
                    return;
                }
                
                console.error(
                    'Failed to set a property: "' + property + '" on a bit-mount :', this._mount!,
                    ' its allowed properties are:', this._definition!.getPropertyNames()
                );
                
                return;
            }
            
            if (forModel && !this._foreignModelBinders.has(property)) {
                this._foreignModelBinders.set(property, () => {
                    let initial = true;
                    this._disposers.push(
                        autorun(() => {
                            prop.value;
                            if (!initial) {
                                emitDomEvent(this._mount!.el!, 'change');
                            }
                            initial = false;
                        })
                    );
                });
            }
            
            prop.value = value;
        });
    }
    
    /**
     * External api to trigger a property update when a bound html element emitted an update event.
     * This is only needed for two-way data binding.
     *
     * @param e The event that was triggered
     * @param target The target element the property is bound to
     * @param prop
     */
    public reactToChangeEvent(e: UIEvent | KeyboardEvent, target: HTMLElement, prop: IPropertyAccessor): void
    {
        if (e.target !== target) {
            return;
        }
        
        const n = getElementValue(target, prop);
        if (n === prop.value) {
            return;
        }
        
        prop.value = n;
    }
    
    /**
     * Helper to create the two way data binding for input fields or child-mount props.
     *
     * @param target
     * @protected
     */
    protected bindTwoWayValue(target: HTMLElement): void
    {
        const property = target.dataset.model ?? null;
        
        if (!property) {
            return;
        }
        
        const prop = this.getAccessor(property);
        
        if (!prop) {
            return;
        }
        
        const bind = (event: string) =>
            this._proxy!.bind(target, event, e => this.reactToChangeEvent(e, target, prop));
        
        bind('change');
        bind('keyup');
        
        setElementValue(target, prop.value);
        
        this._disposers.push(
            autorun(() => setElementValue(target, prop.value))
        );
    }
    
    /**
     * Helper to declare a reactive one-way bound of data to a given dom node
     *
     * @param target The element to create the binding for
     * @param html True if html is allowed, false if the property data should be encoded
     * @protected
     */
    protected bindOneWayContent(target: HTMLElement, html: boolean): void
    {
        const property = target.dataset[html ? 'bindHtml' : 'bind'] ?? null;
        
        if (!property) {
            return;
        }
        
        const prop = this.getAccessor(property);
        
        if (!prop) {
            return;
        }
        
        let initial = true;
        this._disposers.push(
            autorun(() => {
                const val = prop.value;
                
                if (initial) {
                    initial = false;
                    if (val === '') {
                        return;
                    }
                }
                
                setElementContent(target, val, !html);
            })
        );
    }
    
    /**
     * Helper to create a one way data binding between data and attributes of the given target element
     *
     * @param target
     * @protected
     */
    protected bindOneWayAttributes(target: HTMLElement): void
    {
        const map = target.dataset.bindAttr ?? null;
        
        if (!map) {
            return;
        }
        
        forEach(splitMapString(map), pair => {
            const prop = this.getAccessor(pair.source);
            
            if (!prop) {
                return;
            }
            
            this._disposers.push(
                autorun(() => {
                    setElementAttribute(target, pair.target, prop.value);
                })
            );
        });
        
    }
    
    /**
     * Internal helper to bind the static listeners to the dom.
     * This will automatically unbind all previous listeners
     * @protected
     */
    protected bindEventListeners(): void
    {
        // Bind all listeners based on their targets
        const proxy = this._proxy!;
        const bit = this._bit!;
        
        forEach(this._definition!.getEventListeners()!, definition => {
            const targets = definition.provider.call(this._bit!);
            
            if (targets === null) {
                return;
            }
            
            const isList = !!targets && isNumber((targets as any).length) && !(targets as any).addEventListener;
            
            forEach((isList ? targets : [targets]) as Array<HTMLElement>, function (el): void {
                forEach(definition.events, function (event) {
                    proxy.bind(el, event, function (...args) {
                        bit[definition.method].call(bit, ...args);
                    });
                });
            });
        });
    }
    
    /**
     * Helper to execute the given callback if we are bound, or delay the callback to until the bind() method is called
     *
     * @param callback
     * @protected
     */
    protected callOrDelay(callback: Function): void
    {
        if (this._bit) {
            callback();
        } else if (this._delayedActions) {
            this._delayedActions.add(callback);
        }
    }
    
    /**
     * Destroys this data-binder by removing all references
     */
    public destroy(): void
    {
        this.unbindWatchers();
        this._proxy!.destroy();
        
        delete this._mount;
        delete this._proxy;
        delete this._bit;
        delete this._definition;
        delete this._delayedActions;
        this._disposers = null as any;
        this._accessors = null as any;
        this._foreignModelBinders = null as any;
    }
    
    /**
     * Internal helper to call all disposers for watchers we created
     * @protected
     */
    protected unbindWatchers(): void
    {
        forEach(this._disposers, disposer => disposer());
        this._disposers = [];
    }
}