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
 * Last modified: 2021.06.30 at 11:23
 */

import {
    EventEmitter,
    forEach,
    isArray,
    isEmpty,
    isFunction,
    isObject,
    isPlainObject,
    merge
} from '@labor-digital/helferlein';
import type {BitApp} from '../BitApp';
import {BitRegistry} from '../BitRegistry';
import {TranslatorFactory} from '../Translator/TranslatorFactory';
import type {IBitAppOptions, IBitNs} from '../types';
import {DiContainer} from './DiContainer';

export class DiFactory
{
    /**
     * Creates the di container instance for the provided app
     * @param options
     * @param app
     */
    public static make(options: IBitAppOptions, app: BitApp): DiContainer
    {
        return new DiContainer(merge({
            app: () => app,
            bitRegistry: () => DiFactory.makeBitRegistry(options, app),
            translatorFactory: () => new TranslatorFactory(options.lang ?? {}),
            translator: (di: DiContainer) => di.translatorFactory.requireGlobalTranslator(),
            eventBus: () => DiFactory.makeEventBus(options, app)
        }, options.services) as any);
    }
    
    /**
     * Creates the bit registry instance
     * @param options
     * @param app
     * @protected
     */
    protected static makeBitRegistry(options: IBitAppOptions, app: BitApp): BitRegistry
    {
        const registry = new BitRegistry((type: string) => options.bitResolver!(type, app));
        
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
     * Creates a the local event emitter instance and enhancing it with the configured event handlers
     * @protected
     * @param options
     * @param app
     */
    protected static makeEventBus(
        options: IBitAppOptions, app: BitApp
    ): EventEmitter
    {
        const emitter = new EventEmitter();
        
        if (isEmpty(options.events)) {
            return emitter;
        }
        
        forEach(options.events!, (listener, event) => {
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
}

