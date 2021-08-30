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
 * Last modified: 2021.08.02 at 11:23
 */

import {
    EventEmitter,
    forEach,
    isArray,
    isEmpty,
    isFunction,
    isObject,
    isPlainObject,
    makeOptions,
    map,
    merge,
    PlainObject
} from '@labor-digital/helferlein';
import {ModelBindable} from './Binding/Bindable/ModelBindable';
import {OneWayAttrBindable} from './Binding/Bindable/OneWayAttrBindable';
import {OneWayBindable} from './Binding/Bindable/OneWayBindable';
import {OneWayHtmlBindable} from './Binding/Bindable/OneWayHtmlBindable';
import {BindableList} from './Binding/BindableList';
import {IfDirective} from './Binding/Directive/IfDirective';
import type {BitApp} from './BitApp';
import {BitRegistry} from './BitRegistry';
import {DiContainer} from './Di/DiContainer';
import {PluginLoader} from './Plugin/PluginLoader';
import type {TBitPluginList} from './Plugin/types';
import {TemplateRenderer} from './Template/TemplateRenderer';
import type {IAppLifecycleHook, IBitAppOptions, IBitNs, TAppLifecycleHooks} from './types';
import {awaitingForEach} from './util';

export class Bootstrap
{
    
    /**
     * Internal helper to validate given options against the interface schema
     * @param options
     * @protected
     */
    public static prepareOptions(options?: IBitAppOptions): IBitAppOptions
    {
        options = !isPlainObject(options) ? {} : options;
        const hookDef: PlainObject = {
            type: ['function', 'undefined'],
            default: undefined
        };
        
        return makeOptions(options, {
            mountTag: {
                type: 'string',
                default: 'b-mount'
            },
            bits: {
                type: 'plainObject',
                default: () => {}
            },
            bitResolver: {
                type: 'callable',
                default: () => () => null
            },
            services: {
                type: 'plainObject',
                default: () => ({})
            },
            events: {
                type: 'plainObject',
                default: () => ({})
            },
            hooks: {
                type: 'plainObject',
                default: () => ({}),
                children: {
                    created: hookDef,
                    mounted: hookDef
                }
            },
            tpl: {
                type: 'plainObject',
                default: () => ({}),
                children: {
                    adapter: {
                        type: ['callable', 'undefined'],
                        default: undefined
                    }
                }
            },
            plugins: {
                type: 'array',
                default: []
            },
            directives: {
                type: 'plainObject',
                default: () => ({})
            }
        });
    }
    
    /**
     * Creates the di container instance for the provided app
     * @param app
     */
    public static makeContainer(app: BitApp): DiContainer
    {
        return new DiContainer(
            merge(
                {
                    app: () => app,
                    bitRegistry: (di: DiContainer) => Bootstrap.makeBitRegistry(app, di.pluginLoader),
                    eventBus: () => Bootstrap.makeEventBus(app),
                    pluginLoader: (di: DiContainer) => Bootstrap.makePluginLoader(di, app),
                    templateRenderer: () => new TemplateRenderer(app.options.tpl?.adapter),
                    bindableList: (di: DiContainer) => Bootstrap.makeBindableList(app, di.pluginLoader)
                }, app.options.services
            ) as any);
    }
    
    /**
     * Executes a lifecycle hook by executing all registered callbacks in the app option or in plugins
     * @param hookType
     * @param app
     */
    public static runHook(hookType: TAppLifecycleHooks, app: BitApp): Promise<void>
    {
        const hooks: Array<IAppLifecycleHook | null> = [
            ...app.di.pluginLoader.getHooks(hookType),
            ...[app.options.hooks![hookType] ? app.options.hooks![hookType] as any : null]
        ];
        
        return awaitingForEach(hooks, (hook) => {
            if (isFunction(hook)) {
                return hook(app);
            }
        });
    }
    
    /**
     * Creates the bit registry instance
     * @param app
     * @param pluginLoader
     * @protected
     */
    protected static makeBitRegistry(app: BitApp, pluginLoader: PluginLoader): BitRegistry
    {
        const registry = new BitRegistry((type: string) => app.options.bitResolver!(type, app));
        
        const walker = function (bits: IBitNs, ns: string, walker: any) {
            forEach(bits, (ctor, type) => {
                if (isPlainObject(ctor)) {
                    walker(ctor, ns + type + '/', walker);
                    return;
                }
                
                // If the "type" is empty, remove the trailing slash
                registry.add(type === '' ? ns.substr(0, ns.length - 1) : ns + type, ctor);
            });
        };
        
        walker(pluginLoader.getBits(), '', walker);
        
        if (isPlainObject(app.options.bits)) {
            walker(app.options.bits, '', walker);
        }
        
        return registry;
    }
    
    /**
     * Creates the list of bindable classes that should be available in the application.
     * The list is composed of built-in directives, plugin directives and configured directives
     *
     * @param app
     * @param pluginLoader
     * @protected
     */
    protected static makeBindableList(app: BitApp, pluginLoader: PluginLoader): BindableList
    {
        return new BindableList({
            bind: OneWayBindable,
            bindHtml: OneWayHtmlBindable,
            bindAttr: OneWayAttrBindable,
            model: ModelBindable,
            if: IfDirective,
            ...pluginLoader.getDirectives(),
            ...app.options.directives
        });
    }
    
    /**
     * Creates a the local event emitter instance and enhancing it with the configured event handlers
     * @protected
     * @param app
     */
    protected static makeEventBus(app: BitApp): EventEmitter
    {
        const emitter = new EventEmitter();
        
        if (isEmpty(app.options.events)) {
            return emitter;
        }
        
        forEach(app.options.events!, (listener, event) => {
            let priority = undefined;
            
            if (isArray(listener)) {
                priority = listener[1] ?? undefined;
                listener = listener[0];
            }
            
            emitter.bind(event, (e: any) => {
                if (!isFunction(listener)) {
                    return;
                }
                
                const res: any = listener(e, app);
                if (isObject(res) && isFunction(res.catch)) {
                    res.catch((err: any) => console.error(err));
                }
                return res;
            }, priority);
        });
        
        return emitter;
    }
    
    /**
     * Creates the instance of the plugin loader when it is required and automatically
     * registers all configured plugins to be instantiated
     * @param di
     * @param app
     * @protected
     */
    protected static makePluginLoader(di: DiContainer, app: BitApp): PluginLoader
    {
        const loader = new PluginLoader(di);
        map(app.options.plugins as TBitPluginList, plugin => loader.registerPlugin(plugin));
        return loader;
    }
}