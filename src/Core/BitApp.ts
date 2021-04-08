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

import {EventBus, EventEmitter, forEach, isPlainObject, makeOptions} from '@labor-digital/helferlein';
import {configure} from 'mobx';
import {BitRegistry} from './BitRegistry';
import {HmrRegistry} from './HmrRegistry';
import {Es5Adapter} from './Mount/Es5Adapter';
import {Es6Adapter} from './Mount/Es6Adapter';
import {canUseEs6Features} from './Mount/util';
import type {IBitAppOptions, IBitNs} from './types';

export class BitApp
{
    /**
     * @hidden
     */
    protected _mountTag: string;
    
    /**
     * @hidden
     */
    protected _registry: BitRegistry;
    
    constructor(options?: IBitAppOptions)
    {
        options = this.prepareOptions(options);
        this._mountTag = options.mountTag!;
        this._registry = this.makeRegistry(options);
        this.mount(options);
        HmrRegistry.registerApp(this);
    }
    
    /**
     * Returns the instance of the bit registry for this app
     */
    public get registry(): BitRegistry
    {
        return this._registry;
    }
    
    /**
     * Returns the configured bit mount tag for this app
     */
    public get mountTag(): string
    {
        return this._mountTag;
    }
    
    /**
     * Returns the global event bus for this app
     */
    public get eventBus(): EventEmitter
    {
        return EventBus.getEmitter();
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
            }
        });
    }
    
    /**
     * Internal helper to create the bit constructor registry
     * @param options
     * @protected
     */
    protected makeRegistry(options: IBitAppOptions): BitRegistry
    {
        const registry = new BitRegistry((type: string) => options.bitResolver!(type, this));
        
        const walker = function (bits: IBitNs, ns: string, walker: any) {
            forEach(bits, (ctor, type) => {
                if (isPlainObject(ctor)) {
                    walker(ctor, ns + type + '/', walker);
                    return;
                }
                
                // If the "type" is empty, remove the trailing slash
                registry.add(type === ''
                    ? ns.substr(0, ns.length - 1)
                    : ns + type,
                    ctor);
            });
        };
        
        if (isPlainObject(options.bits)) {
            walker(options.bits, '', walker);
        }
        
        return registry;
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