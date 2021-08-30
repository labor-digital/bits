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
 * Last modified: 2021.06.30 at 10:53
 */

import {EventEmitter, forEach, isFunction, PlainObject} from '@labor-digital/helferlein';
import type {BindableList} from '../Binding/BindableList';
import type {BitApp} from '../BitApp';
import type {BitRegistry} from '../BitRegistry';
import type {PluginLoader} from '../Plugin/PluginLoader';
import type {TemplateRenderer} from '../Template/TemplateRenderer';
import type {IGetterProvider} from '../types';
import {makeGetterProvider} from '../util';
import type {IDiContainerOptions, IDiContainerServiceFactory} from './types';

export interface DiContainer
{
    [key: string]: any;
    
    /**
     * Returns the running app object
     */
    readonly app: BitApp;
    
    /**
     * Returns the global event bus/event emitter instance
     */
    readonly eventBus: EventEmitter;
    
    /**
     * The instance of the bit registry for this app
     */
    readonly bitRegistry: BitRegistry;
    
    /**
     * The instance of the plugin loader to load extensions for the bits framework
     */
    readonly pluginLoader: PluginLoader;
    
    /**
     * The template renderer to use in the $tpl method
     */
    readonly templateRenderer: TemplateRenderer;
    
    /**
     * The list of bindable constructors.
     * @internal this is mostly an implementation detail and should not be considered part of the API
     */
    readonly bindableList: BindableList;
    
    // /**
    //  * This store is a super-lightweight alternative to the full-blown vuex.
    //  * It allows you to store some reactive values and share them between your application.
    //  * You can configure the initial state in the appConfig object
    //  */
    // readonly state: AppState
    
    // /**
    //  * The configuration repository to fetch the registered app config from
    //  */
    // readonly config: AppConfig
}

export class DiContainer
{
    protected _factories: PlainObject<IDiContainerServiceFactory> = {};
    protected _instances: PlainObject<object> = {};
    protected _reactiveGetters: IGetterProvider;
    
    public constructor(config: IDiContainerOptions)
    {
        this._reactiveGetters = makeGetterProvider(this, (key) => this.get(key));
        forEach(config, (v, k) => this.setFactory(k, v));
    }
    
    /**
     * Sets the service instance with a certain key
     * @param key The key of the instance to register
     * @param instance The service instance to register
     */
    public set(key: string, instance: object): this
    {
        this._instances[key] = instance;
        this._reactiveGetters.add(key);
        return this;
    }
    
    /**
     * Registers a new factory to create a service with.
     * NOTE: If the service was already instantiated this does nothing.
     *
     * @param key The key of the instance to register the factory for
     * @param factory The function to create a new instance of the service registered for the given key
     */
    public setFactory(key: string, factory: IDiContainerServiceFactory): this
    {
        if (!isFunction(factory)) {
            throw new Error('Invalid factory provided for service with key: "' + key + '"');
        }
        
        this._factories[key] = factory;
        this._reactiveGetters.add(key);
        
        return this;
    }
    
    /**
     * Returns the instance of a specific service which was configured
     * @param key
     */
    public get(key: string): any
    {
        if (this._instances[key]) {
            return this._instances[key];
        }
        
        if (!this._factories[key]) {
            return undefined;
        }
        
        const i = (this._factories[key] as any)(this);
        this._instances[key] = i;
        return i;
    }
    
    /**
     * Checks if the container can resolve a specified service
     * @param key
     */
    public has(key: string): boolean
    {
        return !!(this._instances[key] || this._factories[key]);
    }
}
