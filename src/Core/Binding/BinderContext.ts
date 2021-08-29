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
 * Last modified: 2021.08.28 at 15:18
 */

import type {ComponentProxy} from '@labor-digital/helferlein';
import type {AbstractBit} from '../AbstractBit';
import type {BitContext} from '../BitContext';
import type {Binder} from './Binder';

export class BinderContext
{
    /**
     * The bit instance which contains the bindable
     */
    public bit: AbstractBit;
    
    /**
     * The reference to the binder object of the bit
     */
    public binder: Binder;
    
    /**
     * An internal proxy to listen for events or timeouts.
     * All registered events will be unbound once the context gets destroyed
     */
    public proxy: ComponentProxy;
    
    /**
     * Internal storage for the "ModelBindable" implementation
     * @internal
     * @hidden
     */
    public pullableProperties?: Array<Array<string>>;
    
    constructor(bit: AbstractBit, binder: Binder, proxy: ComponentProxy)
    {
        this.bit = bit;
        this.binder = binder;
        this.proxy = proxy;
    }
    
    /**
     * The context object of the BIT class
     */
    public get bitContext(): BitContext
    {
        return this.bit.$context;
    }
    
    /**
     * Used to destroy the context object - Internal only
     * @internal
     */
    public destroy(): void
    {
        this.proxy.destroy();
        
        this.bit = null as any;
        this.binder = null as any;
        this.proxy = null as any;
        this.pullableProperties = null as any;
    }
}