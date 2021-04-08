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
 * Last modified: 2021.03.09 at 13:43
 */

import {forEach, isFunction, isObject} from '@labor-digital/helferlein';
import type {IBitConstructor, IBitRegistryResolver} from './types';

export class BitRegistry
{
    /**
     * The injected resolver to find the bits with
     * @hidden
     */
    protected _resolver: IBitRegistryResolver;
    
    /**
     * The list of resolved bit constructors
     * @hidden
     */
    protected _bits: Map<string, IBitConstructor>;
    
    constructor(resolver: IBitRegistryResolver)
    {
        this._bits = new Map();
        this._resolver = resolver;
    }
    
    /**
     * Registers a new bit instance for the specified type
     * @param type A type/unique identifier for this bit. This can be virtually any string.
     * @param ctor The bit class/constructor to use when the specified type was required
     */
    public add(type: string, ctor: IBitConstructor): void
    {
        this._bits.set(type, ctor);
    }
    
    /**
     * Tries to resolve the given type and returns a constructor or null if the type could not be resolved.
     * @param type
     */
    public get(type: string): Promise<IBitConstructor | null>
    {
        if (!this._bits.has(type)) {
            return this.resolve(type);
        }
        
        return Promise.resolve(this._bits.get(type)!);
    }
    
    /**
     * Returns the map of all registered bit constructors by their type
     */
    public getAll(): Map<string, IBitConstructor>
    {
        return this._bits;
    }
    
    /**
     * Tries to find all types, that have been registered for the given constructor.
     * This will only search in loaded constructors! Dynamic constructors that are not yet resolved, will be ignored!
     * @param ctor
     */
    public getTypes(ctor: IBitConstructor): Array<string>
    {
        let result: Array<string> = [];
        forEach(this._bits, (bitCtor, type) => {
            if (ctor === bitCtor) {
                result.push(type);
            }
        });
        return result;
    }
    
    /**
     * Internal helper that resolves a given bit type based on the registered dynamic resolver.
     * The result is either a bit constructor or null.
     *
     * The resolved bit (except null was resolved) will be injected into this._bits automatically,
     * so we can resolve the ctor faster in subsequent lookups
     *
     * @param type
     * @protected
     */
    protected async resolve(type: string): Promise<IBitConstructor | null>
    {
        let ctor = null;
        
        try {
            ctor = await this._resolver(type);
        } catch (e) {
            throw new Error('Failed to resolve bit with type: "' + type + '". Error: ' + e.message);
        }
        
        if (ctor === null) {
            return ctor;
        }
        
        ctor = this.translateResolved(ctor);
        if (ctor === null) {
            throw new Error('The bit resolver returned a invalid definition for: "' + type + '"!');
        }
        
        this._bits.set(type, ctor);
        
        return Promise.resolve(ctor);
    }
    
    /**
     * Internal helper to find the actual ctor in es modules when we used something like webpack
     * to import the module dynamically.
     * @param ctor
     * @protected
     */
    protected translateResolved(ctor: any): IBitConstructor | null
    {
        if (isObject(ctor) && ctor) {
            ctor = ctor as any;
            if (ctor.__bit) {
                return ctor;
            }
            
            if (ctor.__esModule) {
                if (ctor.default && ctor.default.__bit) {
                    return ctor.default;
                }
            }
            
            let found = null;
            forEach(ctor, (v) => {
                if (v.__bit) {
                    found = v;
                    return false;
                }
            });
            
            return found;
        }
        
        if (isFunction(ctor) && ctor.__bit) {
            return ctor;
        }
        
        return null;
    }
}