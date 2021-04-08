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
 * Last modified: 2021.04.08 at 22:46
 */

import {forEach, getGuid} from '@labor-digital/helferlein';
import type {BitApp} from './BitApp';
import type {BitMountHTMLElement} from './Mount/types';
import type {IBitConstructor} from './types';

export class HmrRegistry
{
    /**
     * The list of all bit apps that are scanned when a bit constructor gets replaced
     * @protected
     */
    protected static _apps: Set<BitApp> = new Set();
    
    /**
     * The list of all mount elements by their matching hmr module id
     * @protected
     */
    protected static _mountsById: Map<string, Set<BitMountHTMLElement>> = new Map();
    
    /**
     * The list that maps a single mount element to its matching hmr module id
     * @protected
     */
    protected static _idByMount: Map<BitMountHTMLElement, string> = new Map();
    
    /**
     * The list of all bit constructors that are decorated using @Hot(module)
     * @protected
     */
    protected static _hmrBits: Map<string, IBitConstructor> = new Map();
    
    /**
     * Executed every time a bit app is constructed to make it findable by the registry
     * @param app
     */
    public static registerApp(app: BitApp): void
    {
        HmrRegistry._apps.add(app);
    }
    
    /**
     * Used by the mount class to register its HTML element in this registry.
     * Only ctors that have a @Hot decorator applied to them will be considered, all other ctors are ignored.
     *
     * @param el
     * @param ctor
     */
    public static registerMount(el: BitMountHTMLElement, ctor: IBitConstructor): void
    {
        if (!ctor.__hmrId) {
            return;
        }
        
        const id = ctor.__hmrId;
        
        // Register the HTML node by the hmr module id
        const mountMap = HmrRegistry._mountsById;
        if (!mountMap.has(id)) {
            mountMap.set(id, new Set());
        }
        mountMap.get(id)!.add(el);
        
        // Register the hmr module id by the HTML node
        const ctorMap = HmrRegistry._idByMount;
        ctorMap.set(el, id);
    }
    
    /**
     * Used by the mount class to remove itself from this registry when the HTML node is disconnected from the DOM.
     * @param el
     */
    public static unregisterMount(el: BitMountHTMLElement): void
    {
        const ctorMap = HmrRegistry._idByMount;
        const id = ctorMap.get(el);
        
        if (!id) {
            return;
        }
        
        ctorMap.delete(el);
        
        const mountMap = HmrRegistry._mountsById;
        if (!mountMap.has(id)) {
            return;
        }
        
        const elList = mountMap.get(id)!;
        elList.delete(el);
        if (elList.size === 0) {
            mountMap.delete(id);
        }
    }
    
    /**
     * Registers a NEW bit constructor as a hot reloadable module
     * @param ctor
     */
    public static registerCtor(ctor: IBitConstructor): void
    {
        ctor.__hmrId = getGuid('hmrBitCtor-');
        HmrRegistry._hmrBits.set(ctor.__hmrId, ctor);
    }
    
    /**
     * Replaces an existing bit constructor with a newly loaded module
     * @param id
     * @param newCtor
     */
    public static replaceCtor(id: string, newCtor: IBitConstructor): void
    {
        if (!HmrRegistry._hmrBits.has(id)) {
            throw new Error('Error while applying hot reload patch! Could not find hmr ctor with id ' + id);
        }
        
        const oldCtor = HmrRegistry._hmrBits.get(id)!;
        newCtor.__hmrId = id;
        
        HmrRegistry._hmrBits.set(id, newCtor);
        HmrRegistry.patchApps(oldCtor, newCtor);
        HmrRegistry.patchMounts(id);
    }
    
    /**
     * Iterates all registered apps and replaces the old constructor with the new constructor in the bit registry.
     *
     * @param oldCtor
     * @param newCtor
     * @protected
     */
    protected static patchApps(oldCtor: IBitConstructor, newCtor: IBitConstructor): void
    {
        forEach(HmrRegistry._apps, app => {
            const bits = app.registry.getAll();
            
            forEach(bits, (ctor, type) => {
                if (ctor !== oldCtor) {
                    return;
                }
                
                bits.set(type, newCtor);
            });
        });
    }
    
    /**
     * Receives a list of css selectors, finds the matching dom nodes and forces the mount to create a new bit instance
     * @param id
     * @protected
     */
    protected static patchMounts(id: string): void
    {
        const mountMap = HmrRegistry._mountsById;
        if (!mountMap.has(id)) {
            return;
        }
        
        forEach(mountMap.get(id)!, el => {
            const mount = el._bitMount;
            
            // We actively check if the mount is currently connected, this way mounts that have a "keep-alive"
            // attribute set, and are somewhere in LIMBO will only be destroyed and not reconnected.
            // When the element in question is reconnected to the DOM later, the new instance will be created,
            // so we are safe for updates there.
            const isConnected = mount.isConnected;
            mount.disconnect(true);
            if (isConnected) {
                mount.connect(el);
            }
        });
    }
}