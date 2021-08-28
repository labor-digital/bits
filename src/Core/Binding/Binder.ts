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
 * Last modified: 2021.08.28 at 15:17
 */

import {ComponentProxy, emitDomEvent, forEach} from '@labor-digital/helferlein';
import {autorun, runInAction} from 'mobx';
import type {AbstractBit} from '../AbstractBit';
import type {BitDefinition} from '../Definition/BitDefinition';
import {DefinitionRegistry} from '../Definition/DefinitionRegistry';
import type {BitMountHTMLElement} from '../Mount/types';
import {findElement, runOnEventProxy} from '../util';
import {ModelBindable} from './Bindable/ModelBindable';
import {OneWayAttrBindable} from './Bindable/OneWayAttrBindable';
import {OneWayBindable} from './Bindable/OneWayBindable';
import {OneWayHtmlBindable} from './Bindable/OneWayHtmlBindable';
import {BindableList} from './BindableList';
import {BinderContext} from './BinderContext';
import {IfDirective} from './Directive/IfDirective';
import {getPropertyAccessor} from './propertyAccess';
import type {IPropertyAccessor} from './types';
import {getElementValue, setElementAttribute} from './util';

export class Binder
{
    protected _el?: BitMountHTMLElement;
    protected _bit?: AbstractBit;
    protected _definition?: BitDefinition;
    protected _disposers: Array<Function> = [];
    protected _promiseDisposers: Map<number, Function> = new Map();
    protected _promiseIdCount: number = 0;
    protected _accessors: Map<string, IPropertyAccessor> = new Map();
    protected _foreignModelBinders: Map<string, Function> = new Map();
    protected _foreignModelBound: boolean = false;
    protected _delayedActions?: Set<Function> = new Set();
    protected _bindables: BindableList;
    protected _context?: BinderContext;
    
    constructor()
    {
        this._bindables = new BindableList({
            bind: OneWayBindable,
            bindHtml: OneWayHtmlBindable,
            bindAttr: OneWayAttrBindable,
            model: ModelBindable,
            if: IfDirective
        });
    }
    
    /**
     * Used to bind this instance as a glue layer between the DOM nodes and the reactive data
     * of the given bit. It will also bind statically declared event listeners (used by the decorator)
     * to the DOM
     *
     * This is a internal process that MUST be executed ONLY ONCE! Multiple binds on the same
     * bit will cause the universe to grind to a halt; and we don't want that to happen, right?
     *
     * @param bit The instance of the bit class
     */
    public async bind(bit: AbstractBit): Promise<void>
    {
        if (this._bit) {
            throw new Error('The binding provider was already bound, and can not be rebound!');
        }
        
        this._el = bit.$el;
        this._definition = DefinitionRegistry.getDefinitionFor(Object.getPrototypeOf(bit));
        this._context = new BinderContext(bit, this, new ComponentProxy(bit));
        this._bit = bit;
        
        // Bind foreign models to our children
        forEach(this._delayedActions!, a => a());
        delete this._delayedActions;
        
        await this.refresh();
    }
    
    /**
     * Allows you to recreate all bindings on the dom, both for the data and static event listeners
     */
    public async refresh(): Promise<void>
    {
        if (!this._bit || !this._context) {
            return;
        }
        
        // Reset all our current bindings
        this.dispatchDisposers();
        this._context!.proxy!.unbindAll();
        this._accessors = new Map();
        
        this.applyEventListeners();
        await this.applyBindables();
    }
    
    /**
     * Internal helper that creates a new promise which automatically resolves when this binder gets destroyed.
     * @param provider
     * @internal
     */
    public makePromise<T = any>(provider: (
        resolve: (val?: T) => void,
        reject: () => void
    ) => void): Promise<T>
    {
        const id: number = this._promiseIdCount++;
        return new Promise<any>((resolve, reject) => {
            this._promiseDisposers.set(id, () => resolve(null));
            provider((v) => {
                this._promiseDisposers.delete(id);
                resolve(v);
            }, reject);
        });
    }
    
    /**
     * Allows you to create a new property accessor for the linked bit.
     * All accessors are cached and therefore don't bloat the memory.
     *
     * @param property
     * @see getPropertyAccessor for further details
     */
    public getAccessor(property: string): Promise<IPropertyAccessor | null>
    {
        return this.makePromise<IPropertyAccessor | null>(resolve => {
            this.callOrDelay(async () => {
                if (!this._accessors.has(property)) {
                    
                    const accessor = await getPropertyAccessor(
                        this._bit!,
                        property,
                        this._definition!.getPropertyNames()
                    );
                    
                    if (accessor === null) {
                        return resolve(null);
                    }
                    
                    this._accessors.set(property, accessor);
                }
                
                resolve(this._accessors.get(property) ?? null);
            });
        });
    }
    
    /**
     * Internal API that allows the parent bit to read a public property from the local bit.
     * If the local bit is not yet mounted, a promise will be returned which resolves when the binding is ready.
     *
     * @param property the name of the local property to return the value for
     */
    public getForeignProperty(property: string): Promise<any>
    {
        return this.makePromise(resolve => {
            this.callOrDelay(async () => {
                const renderError = () => console.error(
                    'You can\'t read property: "' + property + '" externally'
                    + ', because it was not registered publicly as prop using the @Property() decorator! '
                    + 'Failed mount:',
                    this._el!
                );
                
                if (!this.isPublicProperty(property)) {
                    renderError();
                    return resolve(null);
                }
                
                const prop = await this.getAccessor('value');
                if (prop === null) {
                    renderError();
                    return resolve(null);
                }
                
                resolve(prop.get());
            });
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
        this.callOrDelay(async () => {
            if (!this.isPublicProperty(property)) {
                console.error(
                    'You can\'t bind property: "' + property + '" externally'
                    + ', because it was not registered publicly as prop using the @Property() decorator! '
                    + 'Failed mount:',
                    this._el!
                );
                return;
            }
            
            const prop = await this.getAccessor(property);
            
            if (prop === null) {
                if (!forModel) {
                    setElementAttribute(this._el!, property, value, true);
                    return;
                }
                
                console.error(
                    'Failed to set a property: "' + property + '" on a bit-mount :', this._el!,
                    ' its allowed properties are:', this._definition!.getPropertyNames()
                );
                
                return;
            }
            
            if (forModel && !this._foreignModelBinders.has(property)) {
                const modelBinder = () => {
                    let initial = true;
                    this._disposers.push(
                        autorun(() => {
                            prop.get();
                            
                            if (!initial) {
                                emitDomEvent(this._el!, 'change');
                            }
                            
                            initial = false;
                        })
                    );
                };
                
                this._foreignModelBinders.set(property, modelBinder);
                
                if (this._foreignModelBound) {
                    modelBinder();
                }
            }
            
            prop.set(value);
        });
    }
    
    /**
     * Returns true if the given property name a.) exists and b.) has a registered, public attribute
     * @param property
     */
    public isPublicProperty(property: string): boolean
    {
        return this._definition?.hasAttribute(property) ?? false;
    }
    
    /**
     * External api to trigger a property update when a bound html element emitted an update event.
     * This is only needed for two-way data binding.
     *
     * @param e The event that was triggered
     * @param target The target element the property is bound to
     * @param prop
     */
    public async reactToChangeEvent(
        e: UIEvent | KeyboardEvent,
        target: HTMLElement,
        prop: IPropertyAccessor
    ): Promise<void>
    {
        if (e.target !== target) {
            return;
        }
        
        const n = await getElementValue(target, prop);
        if (n === prop.get()) {
            return;
        }
        
        prop.set(n);
    }
    
    /**
     * Destroys this data-binder by removing all references
     * @internal
     */
    public destroy(): void
    {
        this.dispatchDisposers();
        this._context!.destroy();
        
        this._el = null as any;
        this._context = null as any;
        this._bindables = null as any;
        this._bit = null as any;
        this._definition = null as any;
        this._delayedActions = null as any;
        this._promiseDisposers = null as any;
        this._disposers = null as any;
        this._accessors = null as any;
        this._foreignModelBinders = null as any;
        this._foreignModelBound = null as any;
        this._promiseIdCount = null as any;
    }
    
    /**
     * Executes all known disposers and clears their list
     * @protected
     */
    protected dispatchDisposers(): void
    {
        forEach(this._promiseDisposers, disposer => disposer());
        forEach(this._disposers, disposer => disposer());
        this._disposers = [];
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
     * Internal helper to bind the static listeners to the dom.
     * This will automatically unbind all previous listeners
     * @protected
     */
    protected applyEventListeners(): void
    {
        forEach(this._definition!.getEventListeners()!, definition => {
            runOnEventProxy.call(
                this._bit!,
                this._context!.proxy,
                definition.target,
                definition.deep,
                definition.events,
                this._bit![definition.method],
                'bind'
            );
        });
    }
    
    /**
     * Internal helper to iterate all bindables and bind them to the DOM
     * @protected
     */
    protected applyBindables(): Promise<void>
    {
        const context = this._context;
        
        if (!context) {
            return Promise.resolve();
        }
        
        return this.makePromise(resolve => {
            const disposers = this._disposers;
            const children: Array<Promise<any>> = [];
            runInAction(() => {
                this._context!.pullableProperties = [];
                
                this._bindables.forEach(config => {
                    forEach(findElement(this._el!, config.selector, true),
                        function (target) {
                            const i = new config.ctor(target, context);
                            
                            const value = target.dataset[config.dataKey] ?? undefined;
                            
                            if (i.requireValue && !value) {
                                console.error(
                                    'Failed to create a "' + config.key + '" binding, because the data attribute '
                                    + 'does not contain any value, but is required by the binding type. '
                                    + 'Failing object: ', target);
                                return;
                            }
                            
                            children.push(i.bind(value));
                            disposers.push(i.destroy);
                        }
                    );
                });
                
            });
            
            Promise.all(children).then(() => {
                delete context.pullableProperties;
                resolve();
            });
        });
        
    }
}