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


import type {ComponentProxyEventTarget} from '@labor-digital/helferlein';
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
}
