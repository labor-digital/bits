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
 * Last modified: 2021.03.09 at 13:37
 */

import {EventEmitter, isPlainObject, makeOptions} from '@labor-digital/helferlein';
import {configure} from 'mobx';
import type {BitRegistry} from './BitRegistry';
import type {DiContainer} from './Di/DiContainer';
import {DiFactory} from './Di/DiFactory';
import {HmrRegistry} from './HmrRegistry';
import {Es5Adapter} from './Mount/Es5Adapter';
import {Es6Adapter} from './Mount/Es6Adapter';
import {canUseEs6Features} from './Mount/util';
import type {TranslatorFactory} from './Translator/TranslatorFactory';
import type {IBitAppOptions} from './types';

export class BitApp
{
    /**
     * The instance of the dependency injection container
     * @hidden
     */
    protected _di: DiContainer;
    
    /**
     * @hidden
     */
    protected _mountTag: string;
    
    constructor(options?: IBitAppOptions)
    {
        options = this.prepareOptions(options);
        this._mountTag = options.mountTag!;
        this._di = DiFactory.make(options, this);
        this.mount(options);
        HmrRegistry.registerApp(this);
    }
    
    /**
     * Returns the instance of the bit registry for this app
     * @deprecated removed in the next major release - use di.bitRegistry instead
     */
    public get registry(): BitRegistry
    {
        return this._di.bitRegistry;
    }
    
    /**
     * Returns the configured bit mount tag for this app
     */
    public get mountTag(): string
    {
        return this._mountTag;
    }
    
    /**
     * Returns the dependency injection container for this app
     */
    public get di(): DiContainer
    {
        return this._di;
    }
    
    /**
     * Returns the global event bus for this app
     * @deprecated removed in the next major release - use di.eventBus instead
     */
    public get eventBus(): EventEmitter
    {
        return this._di.eventBus;
    }
    
    /**
     * Internal access to the translator factory
     * @deprecated removed in the next major release - use di.translatorFactory instead
     */
    public get translatorFactory(): TranslatorFactory
    {
        return this._di.translatorFactory;
    }
    
    /**
     * Internal helper to validate given options against the interface schema
     * @param options
     * @protected
     */
    protected prepareOptions(options?: IBitAppOptions): IBitAppOptions
    {
        return makeOptions(!isPlainObject(options) ? {} : options, {
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
            // These options are validated by the TranslatorFactory
            lang: {
                type: 'plainObject',
                default: () => ({})
            },
            services: {
                type: 'plainObject',
                default: () => ({})
            },
            events: {
                type: 'plainObject',
                default: () => ({})
            }
        });
    }
    
    /**
     * Internal helper to register the mount bit as a custom element
     * @param options
     * @protected
     */
    protected mount(options: IBitAppOptions): this
    {
        const app = this;
        
        if (canUseEs6Features()) {
            window.customElements.define(options.mountTag!, // @ts-ignore
                class extends Es6Adapter
                {
                    constructor() {super(app);}
                }
            );
        } else {
            configure({useProxies: 'never'});
            Es5Adapter.registerApp(this);
        }
        
        return this;
    }
}