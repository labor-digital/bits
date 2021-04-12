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


import type {ComponentProxyEventTarget, PlainObject} from '@labor-digital/helferlein';
import type {EventEmitterEvent} from '@labor-digital/helferlein/dist/Events/EventEmitter';
import type {TemplateResult} from 'lit-html';
import type {AbstractBit} from './AbstractBit';
import type {BitApp} from './BitApp';
import type {BitContext} from './BitContext';

export type TEventTarget =
    ComponentProxyEventTarget
    | IEventTargetProvider
    | Array<ComponentProxyEventTarget>
    | NodeListOf<any>
    | true
    | string;

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

export interface IHtmlTemplateProvider
{
    (this: AbstractBit): TemplateResult;
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

export interface IBitAppTranslationConfigurator
{
    (translator: any): any
}

export interface IBitAppTranslationOptions
{
    /**
     * The two char iso code of the language the translation should work with.
     * If this value is omitted, bits will try to read it from the HTML tag.
     * Can be overwritten on a per-bit level using the "bt-locale" attribute
     */
    locale?: string
    
    /**
     * The default locale to use as a fallback if a certain label was not found
     */
    defaultLocale?: string;
    
    /**
     * Allows you to provide the phrases for the translator.
     * If omitted, there is nothing you can translate, what else to say :D?
     * Can be extended on a per-bit level using the "bt-phrases" attribute
     */
    phrases?: PlainObject
    
    /**
     * Allows you to configure the actual translator instance on a low level.
     * This method is executed every time a new translator instance is generated.
     */
    configurator?: IBitAppTranslationConfigurator
    
    /**
     * By default the app will load additional options from the DOM on script[data-bit-translation] tags,
     * to extend the options given when the app is created. If you set this to true, this feature can be disabled.
     */
    disableJsOptions?: boolean
}

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
     * Options for the translator and localization
     */
    lang?: IBitAppTranslationOptions
}

export type TLowLevelTranslator = typeof import('translate-js');