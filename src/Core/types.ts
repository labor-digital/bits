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
 * Last modified: 2021.03.09 at 14:40
 */


import type {ComponentProxyEventTarget, EventEmitterEvent, PlainObject} from '@labor-digital/helferlein';
import type {AbstractBit} from './AbstractBit';
import type {BitApp} from './BitApp';
import type {BitContext} from './BitContext';
import type {IDiContainerOptions} from './Di/types';
import type {IBitPlugin, IBitPluginFactory} from './Plugin/types';
import type {ITemplateRendererAdapter} from './Template/types';

export type TEventTarget =
    ComponentProxyEventTarget
    | IEventTargetProvider
    | Array<ComponentProxyEventTarget>
    | NodeListOf<any>
    | true
    | string;

export type TElementOrList = HTMLElement | Element | NodeListOf<Element> | Array<Element> | null | string | undefined;

export interface IEventTargetProvider
{
    (this: AbstractBit): TEventTarget
}

export type TCustomEvent = Event | EventEmitterEvent | any;

export interface IEventListener
{
    (event: TCustomEvent): void | any;
}

export type TEventList = string | Array<string>;

export interface IPropertyWatcher
{
    (n: any, o: any): void
}

export interface IBitConstructor
{
    new(context: BitContext): AbstractBit
    
    /**
     * @hidden
     */
    __bit: true
    
    /**
     * @hidden
     */
    __hmrId?: string
}

export interface IBitResolver
{
    (type: string, app: BitApp): Promise<IBitConstructor | null>;
}

export interface IBitNs
{
    [key: string]: IBitConstructor | IBitNs
}

export interface IBitRegistryResolver
{
    (type: string): Promise<IBitConstructor | null>;
}

export interface IGetterProvider
{
    /**
     * Adds a new getter to the target on the fly
     * @param key The property to be registered as getter
     */
    add: (key: string) => void
}

export type TAppLifecycleHooks = 'created' | 'mounted';

export interface IAppLifecycleHook
{
    (app: BitApp): void | Promise<void>
}

export interface IAppEventListener
{
    (evt: EventEmitterEvent, app: BitApp): void;
}

export type IAppEventListenerWithPriority = [IAppEventListener, number]


export interface IBitAppOptions
{
    /**
     * The name of the html tag to use as bit mount root element
     * Default: b-mount
     */
    mountTag?: string
    
    /**
     * The list of registered bits that should be registered in this app.
     * You should provide the "type" and the constructor as a associative list
     */
    bits?: IBitNs,
    
    /**
     * Allows you to resolve the bit instance based on a given type asynchronously.
     * This allows you, for example to resolve bits using webpack' dynamic import for chunk splitting
     */
    bitResolver?: IBitResolver
    
    /**
     * The list of service definitions to register in the service container
     */
    services?: IDiContainerOptions;
    
    /**
     * A list of event names and their matching listeners that should
     * be registered when the frameworks creates the event emitter instance
     */
    events?: PlainObject<IAppEventListener | IAppEventListenerWithPriority>
    
    /**
     * A list of lifecycle hooks of the app itself
     */
    hooks?: {
        /**
         * Executed when the app was successfully created but is NOT yet mounted to the DOM
         */
        created?: IAppLifecycleHook
        /**
         * Executed when the app was successfully bound to the DOM
         */
        mounted?: IAppLifecycleHook
    }
    
    /**
     * A list of plugins that should be loaded in the application
     */
    plugins?: Array<IBitPlugin | IBitPluginFactory>
    
    /**
     * Template rendering options using the $tpl() method
     */
    tpl?: {
        /**
         * A template renderer adapter for a template engine integration.
         * By default a simple {{marker}} replacer is included, you can use tplAdapterHandlebars()
         * to use handlebars
         */
        adapter: ITemplateRendererAdapter
    }
}