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

import {ComponentProxy, emitDomEvent, forEach} from '@labor-digital/helferlein';
import {autorun, IReactionDisposer, runInAction} from 'mobx';
import type {AbstractBit} from '../Core/AbstractBit';
import type {BitDefinition} from '../Core/Definition/BitDefinition';
import {DefinitionRegistry} from '../Core/Definition/DefinitionRegistry';
import type {Mount} from '../Core/Mount/Mount';
import {findElement, runOnEventProxy} from '../Core/util';
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
    protected _foreignModelBound: boolean = false;
    protected _promises: Map<number, Function> = new Map();
    protected _promiseIdCount: number = 0;
    protected _pullableProperties?: Array<Array<string>>;
    
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
    public async bind(mount: Mount, bit: AbstractBit): Promise<void>
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
        
        await this.refresh();
    }
    
    /**
     * Allows you to recreate all bindings on the dom, both for the data and static event listeners
     */
    public async refresh(): Promise<void>
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
        this._foreignModelBound = true;
        forEach(this._foreignModelBinders, binder => binder());
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
        return this.makeDestroyablePromise<IPropertyAccessor | null>(resolve => {
            this.callOrDelay(async () => {
                if (!this._accessors.has(property)) {
                    const accessor = await getPropertyAccessor(this._bit!, property,
                        this._definition!.getPropertyNames());
                    
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
     * Does the same as getAccessor() but is designed as internal API between
     * @param property
     */
    public getForeignAccessor(property: string): Promise<IPropertyAccessor | null>
    {
        const id: number = this._promiseIdCount++;
        return new Promise<any>(resolve => {
            this._promises.set(id, () => resolve(null));
            
            resolve(this.getAccessor(property));
        });
    }
    
    /**
     * Internal helper to find all data bindings and create the glue for the given specification
     * @protected
     */
    protected bindData(): Promise<void>
    {
        const selector = // OneWay: Escaped data binding
            '*[data-bind],'
            // OneWay: Unescaped data binding
            + '*[data-bind-html],'
            // OneWay: Attribute binding
            + '*[data-bind-attr],'
            // TwoWay: Model binding on elements
            + '*[data-model]';
        
        return this.makeDestroyablePromise(resolve => {
            const children: Array<Promise<any>> = [];
            runInAction(() => {
                this._pullableProperties = [];
                forEach(findElement(this._mount!.el!, selector, true), target => {
                    children.push((async () => {
                        // OneWay: Escaped data binding
                        await this.bindOneWayContent(target, false);
                        // OneWay: Unescaped data binding
                        await this.bindOneWayContent(target, true);
                        // OneWay: Attribute binding
                        await this.bindOneWayAttributes(target);
                        // TwoWay: Model binding on elements
                        await this.bindTwoWayValue(target);
                    })());
                });
            });
            
            Promise.all(children).then(() => {
                delete this._pullableProperties;
                resolve();
            });
        }).then();
    }
    
    /**
     * Internal API that allows the parent bit to read a public property from the local bit.
     * If the local bit is not yet mounted, a promise will be returned which resolves when the binding is ready.
     *
     * @param property the name of the local property to return the value for
     */
    public getForeignProperty(property: string): Promise<any>
    {
        return this.makeDestroyablePromise(resolve => {
            this.callOrDelay(async () => {
                const renderError = () => console.error(
                    'You can\'t read property: "' + property + '" externally'
                    + ', because it was not registered publicly as prop using the @Property() decorator! '
                    + 'Failed mount:',
                    this._mount!.el!
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
                    this._mount!.el!
                );
                return;
            }
            
            const prop = await this.getAccessor(property);
            
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
                const modelBinder = () => {
                    let initial = true;
                    this._disposers.push(
                        autorun(() => {
                            prop.get();
                            
                            if (!initial) {
                                emitDomEvent(this._mount!.el!, 'change');
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
     * Helper to create the two way data binding for input fields or child-mount props.
     *
     * @param target
     * @protected
     */
    protected async bindTwoWayValue(target: HTMLElement): Promise<void>
    {
        const property = target.dataset.model ?? null;
        
        if (!property) {
            return;
        }
        
        const prop = await this.getAccessor(property);
        
        if (!prop) {
            return;
        }
        
        const bind = (event: string) =>
            this._proxy!.bind(target, event, e => this.reactToChangeEvent(e, target, prop));
        
        bind('change');
        bind('keyup');
        
        // If the value is NULL we register this property as nullable, meaning
        // even if we pull multiple instances (options, checkbox,...) for the same property
        // it will pull all variants
        const propertyValue = prop.get();
        if (propertyValue === null) {
            this._pullableProperties!.push(prop.path);
        }
        
        // Either pull the value into the property (property is NULL), or set the value of the input field (not NULL)
        if (this._pullableProperties!.indexOf(prop.path) !== -1) {
            prop.set(await getElementValue(target, prop));
        } else {
            setElementValue(target, propertyValue);
        }
        
        this._disposers.push(
            autorun(() => setElementValue(target, prop.get()))
        );
    }
    
    /**
     * Helper to declare a reactive one-way bound of data to a given dom node
     *
     * @param target The element to create the binding for
     * @param html True if html is allowed, false if the property data should be encoded
     * @protected
     */
    protected async bindOneWayContent(target: HTMLElement, html: boolean): Promise<void>
    {
        const property = target.dataset[html ? 'bindHtml' : 'bind'] ?? null;
        
        if (!property) {
            return;
        }
        
        const prop = await this.getAccessor(property);
        
        if (!prop) {
            return;
        }
        
        let initial = true;
        this._disposers.push(
            autorun(() => {
                const val = prop.get();
                
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
    protected bindOneWayAttributes(target: HTMLElement): Promise<void>
    {
        const map = target.dataset.bindAttr ?? null;
        
        if (!map) {
            return Promise.resolve();
        }
        
        const children: Array<Promise<any>> = [];
        forEach(splitMapString(map), pair => {
            this.makeDestroyablePromise(async resolve => {
                const prop = await this.getAccessor(pair.source);
                
                if (!prop) {
                    return;
                }
                
                this._disposers.push(
                    autorun(() => {
                        setElementAttribute(target, pair.target, prop.get());
                    })
                );
                
                resolve();
            });
        });
        
        return Promise.all(children).then();
    }
    
    /**
     * Internal helper to bind the static listeners to the dom.
     * This will automatically unbind all previous listeners
     * @protected
     */
    protected bindEventListeners(): void
    {
        forEach(this._definition!.getEventListeners()!, definition => {
            runOnEventProxy.call(
                this._bit!,
                this._proxy!,
                definition.target,
                definition.deep,
                definition.events,
                this._bit![definition.method],
                'bind'
            );
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
     * Internal helper that creates a new promise which automatically resolves when this binder gets destroyed.
     * @param provider
     * @protected
     */
    protected makeDestroyablePromise<T = any>(provider: (
        resolve: (val?: T) => void,
        reject: () => void
    ) => void): Promise<T | null>
    {
        const id: number = this._promiseIdCount++;
        return new Promise<any>((resolve, reject) => {
            this._promises.set(id, () => resolve(null));
            provider((v) => {
                this._promises.delete(id);
                resolve(v);
            }, reject);
        });
    }
    
    /**
     * Destroys this data-binder by removing all references
     */
    public destroy(): void
    {
        this.unbindWatchers();
        this._proxy?.destroy();
        
        forEach(this._promises, disposer => disposer());
        
        delete this._mount;
        delete this._proxy;
        delete this._bit;
        delete this._definition;
        delete this._delayedActions;
        this._disposers = null as any;
        this._accessors = null as any;
        this._foreignModelBinders = null as any;
        this._foreignModelBound = null as any;
        this._promises = null as any;
        this._promiseIdCount = null as any;
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