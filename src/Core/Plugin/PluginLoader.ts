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
 * Last modified: 2021.08.02 at 11:08
 */

// import {LitHtmlPlugin} from '@labor-digital/bits-lit-html';
// import {TranslatorPlugin} from '@labor-digital/bits-translator';
import {forEach, isFunction, isPlainObject, merge, PlainObject} from '@labor-digital/helferlein';
import type {AbstractBit} from '../AbstractBit';
import type {IDirectiveCtor} from '../Binding/types';
import type {DiContainer} from '../Di/DiContainer';
import type {IBitNs, TAppLifecycleHooks} from '../types';
import type {IBitPlugin, IBitPluginExtensionInjector, IBitPluginHandler, TBitPluginList} from './types';

export class PluginLoader
{
    /**
     * The dependency injection container
     * @protected
     */
    protected _container: DiContainer;
    
    /**
     * True after the plugin instances have been created and it is no longer
     * allowed to register plugins
     * @protected
     */
    protected _pluginsLoaded: boolean = false;
    
    /**
     * The list of plugins that have been registered
     * @protected
     */
    protected _plugins: TBitPluginList = [];
    
    protected _bitExtender: IBitPluginHandler = () => {};
    protected _bitDestructor: IBitPluginHandler = () => {};
    
    constructor(container: DiContainer)
    {
        this._container = container;
    }
    
    /**
     * Registers a new plugin into the loader.
     * NOTE: Plugins can only be registered until they have been required through the "plugins" getter
     * @param plugin
     */
    public registerPlugin(plugin: IBitPlugin): this
    {
        if (this._pluginsLoaded) {
            throw new Error(
                'It is no longer allowed to register plugins, because the instance have already been created');
        }
        
        this._plugins.push(plugin);
        return this;
    }
    
    /**
     * Returns the list of initialized plugins
     */
    public get plugins(): TBitPluginList
    {
        if (!this._pluginsLoaded) {
            this.loadPlugins();
        }
        
        return this._plugins;
    }
    
    /**
     * Returns the list of available hooks for all registered plugins
     * @param hookType
     */
    public getHooks(hookType: TAppLifecycleHooks): Array<Function>
    {
        const hooks: Array<Function> = [];
        forEach(this.plugins, plugin => {
            if (isFunction(plugin[hookType] as any)) {
                hooks.push(plugin[hookType] as any);
            }
        });
        return hooks;
    }
    
    /**
     * Returns the list of all bits that have been provided by all registered plugins
     */
    public getBits(): IBitNs
    {
        return this.runProviderMethod('provideBits');
    }
    
    /**
     * Returns the list of all directives that have been provided by the registered plugins
     */
    public getDirectives(): PlainObject<IDirectiveCtor>
    {
        return this.runProviderMethod('provideDirectives');
    }
    
    /**
     * Applies all registered extensions to the given bit instance
     * @param bit
     */
    public extendBit(bit: AbstractBit): void
    {
        this._bitExtender(bit);
    }
    
    /**
     * Executes all destructors on a given bit instance when it is being destroyed
     * @param bit
     */
    public destroyBit(bit: AbstractBit): void
    {
        this._bitDestructor(bit);
    }
    
    /**
     * Internal helper to load and initialize the list of registered plugins
     * @protected
     */
    protected loadPlugins(): void
    {
        if (this._pluginsLoaded) {
            return;
        }
        
        this._pluginsLoaded = true;
        
        if (this._plugins.length === 0) {
            return;
        }
        
        const injector = this.makeInjector();
        const filtered: TBitPluginList = [];
        const app = this._container.app;
        forEach(this._plugins, plugin => {
            if (isFunction(plugin)) {
                plugin = plugin(this._container, app);
            }
            
            filtered.push(plugin);
            
            if (isFunction(plugin.initialized)) {
                plugin.initialized(app);
            }
            
            if (isFunction(plugin.extendBits)) {
                plugin.extendBits(injector, app);
            }
        });
        
        this._plugins = filtered;
    }
    
    /**
     * Creates the extension injector function without exposing dependencies on our inner "this"
     * @protected
     */
    protected makeInjector(): IBitPluginExtensionInjector
    {
        const that = this;
        return function (key: string, callbackOrOptions) {
            key = '$' + (key + '').replace(/^\$+/, '');
            const isObj = isPlainObject(callbackOrOptions);
            const isGetter = isObj && (callbackOrOptions as any).getter;
            const callback = isObj ? (callbackOrOptions as any).callback : callbackOrOptions;
            const destructor = isObj ? (callbackOrOptions as any).destructor : null;
            
            if (!isFunction(callback)) {
                throw new Error(
                    'Failed to inject plugin extension with key: "' + key + '" invalid callback!');
            }
            
            that.wrapExtensionCaller('_bitExtender', function (bit) {
                if (isGetter) {
                    Object.defineProperty(bit, key, {get: callback});
                } else {
                    bit[key] = callback;
                }
            });
            
            if (isFunction(destructor)) {
                that.wrapExtensionCaller('_bitDestructor', function (bit) {
                    destructor.call(bit, bit);
                });
            }
        };
    }
    
    /**
     * Instead of looping through a list of callbacks over and over again,
     * this method wraps the caller of the provided property in the provided callback.
     *
     * @param property
     * @param callback
     * @protected
     */
    protected wrapExtensionCaller(property: string, callback: (bit: AbstractBit) => void): void
    {
        const parent = this[property];
        this[property] = function (bit: AbstractBit) {
            callback(bit);
            parent(bit);
        };
    }
    
    /**
     * Internal helper to run a provider method on all registered plugin instances
     * @param methodName
     * @protected
     */
    protected runProviderMethod(methodName: string): PlainObject
    {
        let list: PlainObject = {};
        
        const app = this._container.app;
        forEach(this.plugins, plugin => {
            if (isFunction(plugin[methodName])) {
                list = merge(list, plugin[methodName](app)) as PlainObject;
            }
        });
        
        return list;
    }
}