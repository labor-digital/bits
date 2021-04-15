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
 * Last modified: 2021.03.10 at 22:20
 */

import {Binder} from '../../Binding/Binder';
import {Provider} from '../../Reactivity/Provider';
import type {AbstractBit} from '../AbstractBit';
import type {BitApp} from '../BitApp';
import {BitContext} from '../BitContext';
import {HmrRegistry} from '../HmrRegistry';
import type {BitMountHTMLElement} from './types';

export class Mount
{
    protected _el?: BitMountHTMLElement;
    
    /**
     * The instance of the bit used in this mount
     */
    protected _i?: AbstractBit;
    
    /**
     * The bit app that is connected to this mount
     * @protected
     */
    protected _app: BitApp;
    
    /**
     * Holds a arbitrary timeout after the component was removed from the dom.
     * While the timeout runs, the _initialContent is kept inside the element node.
     * When the timeout finishes, _initialContent will be reset to an empty string
     * @protected
     */
    protected _contentFlushTimeout: number;
    
    /**
     * Holds the initial innerHTML of the mount node. This allows us to restore the initial
     * state when the mount is removed from the dom.
     * @protected
     */
    protected _initialContent: string;
    
    /**
     * Internal helper to listen to the domChange event and trigger the required actions for it.
     * @protected
     */
    protected _changeListener?: () => void;
    
    /**
     * An internal helper to allow the lookup of "el" to trigger a dependency on the reactivity provider
     * @hidden
     * @protected
     */
    protected _onElGet?: () => void;
    
    /**
     * Keeps track if the mount is currently connected to the DOM or not
     * @protected
     */
    protected _isConnected: boolean = false;
    
    constructor(app: BitApp)
    {
        this._contentFlushTimeout = 0;
        this._initialContent = '';
        this._app = app;
    }
    
    /**
     * Returns the html element this mount is bound to
     */
    public get el(): BitMountHTMLElement | undefined
    {
        if (this._onElGet) {
            this._onElGet();
        }
        
        return this._el;
    }
    
    /**
     * Returns the instance of the bit or undefined if there is none currently active.
     */
    public get bit(): AbstractBit | undefined
    {
        return this._i;
    }
    
    /**
     * Returns true if the bit is currently connected to the DOM, false if not
     */
    public get isConnected(): boolean
    {
        return this._isConnected;
    }
    
    /**
     * Connects the mounted html element with the configured bit class
     */
    public async connect(el: BitMountHTMLElement)
    {
        this._isConnected = true;
        this._el = el;
        
        clearTimeout(this._contentFlushTimeout);
        
        const isNew = await this.instantiateBitIfRequired();
        
        setTimeout(async () => {
            if (!this._i || !this._el) {
                return;
            }
            
            if (isNew) {
                const ctx: BitContext = this._i.$context;
                
                // Bind the internal helpers
                const react = ctx.reactivityProvider;
                const binder = ctx.binder;
                react.bind(this, this._i);
                binder.bind(this, this._i);
                
                // Set up the dependency on "domChange" when el is used
                this._onElGet = () => {
                    react.domChangeDependency();
                };
                
                // Bind listener to refresh the bindings when the domChange event was executed
                this._changeListener = () => {
                    binder.refresh();
                    react.reactToDomChanged();
                    
                    if (this._i?.domChanged) {
                        this._i.domChanged();
                    }
                };
                this.el!.addEventListener('domChange', this._changeListener);
                
                // Because this library is a hybrid that works with the actual dom
                // we must store the initial HTML content, so we can restore it when the component gets rebound.
                if (this._initialContent === '') {
                    this._initialContent = this.el!.innerHTML;
                }
                
                if (this._i?.mounted) {
                    await this._i.mounted();
                }
                
                react.executeStaticAutoRun();
            } else {
                if (this._i?.remounted) {
                    await this._i.remounted();
                }
            }
        });
    }
    
    /**
     * Disconnects this mount from a bit instance, by destroying the instance and restoring the initial dom node
     */
    public disconnect(force?: boolean): void
    {
        if (!this._i || !this._el) {
            return;
        }
        
        const keepAlive = this._el.getAttribute('keep-alive') ?? false;
        
        if (this._i?.unmounted) {
            this._i.unmounted();
        }
        
        if (!keepAlive || force) {
            HmrRegistry.unregisterMount(this._el);
            
            this._i.$destroy();
            this._el.innerHTML = this._initialContent;
            this._isConnected = false;
            delete this._onElGet;
            
            if (this._i.destroyed) {
                this._i.destroyed();
            }
            
            if (this._changeListener) {
                this._el.removeEventListener('domChange', this._changeListener);
                delete this._changeListener;
            }
            
            // We use a timeout workaround to make sure the content gets flushed after 200ms
            // meaning there is a time-frame where the content stays in place if the node gets moved in the dom tree
            this._contentFlushTimeout = setTimeout(() => {
                this._initialContent = '';
            }, 200) as any;
            
            delete this._i;
            delete this._el;
        }
    }
    
    /**
     * Internal helper to create a new instance of the bit class that is defined using the type attribute.
     * @protected
     */
    protected async instantiateBitIfRequired(): Promise<boolean>
    {
        if (this._i || !this._el) {
            return false;
        }
        
        const type = this._el.getAttribute('type');
        if (!type || type === '') {
            console.error('Missing required attribute "type" to define the bit type!');
            return Promise.resolve(false);
        }
        
        const ctor = await this._app.registry.get(type);
        
        if (ctor === null) {
            console.error('Invalid bit type given!', type);
            return false;
        }
        
        HmrRegistry.registerMount(this._el, ctor);
        
        const react = new Provider();
        const binder = new Binder();
        
        const context = new BitContext(
            this,
            this._app,
            react,
            binder
        );
        
        this._i = new ctor(context);
        
        if (this._i!.created) {
            await this._i!.created();
        }
        
        return true;
    }
}