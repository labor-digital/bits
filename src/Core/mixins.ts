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
 * Last modified: 2021.03.14 at 16:07
 */

import {forEach} from '@labor-digital/helferlein';
import {AbstractBit} from './AbstractBit';
import type {BitContext} from './BitContext';
import {DefinitionRegistry} from './Definition/DefinitionRegistry';

type BitClass<V> = { new(...args: any[]): V & AbstractBit } & typeof AbstractBit

type UnionToIntersection<U> = (U extends any
    ? (k: U) => void : never) extends (k: infer I) => void
    ? I : never

type ExtractInstance<T> = T extends BitClass<infer V> ? V : never

type MixedBitClass<Mixins extends BitClass<AbstractBit>[]> = Mixins extends (infer T)[]
    ? BitClass<UnionToIntersection<ExtractInstance<T>>>
    : never

/**
 * The list of lifecycle hooks that must be merged when a new mixin instance is created
 */
const lifecycleHooks = ['created', 'mounted', 'unmounted', 'remounted', 'beforeDestroy', 'destroyed', 'domChanged'];


export function mixins<T extends BitClass<AbstractBit>[]>(...ctors: T): MixedBitClass<T>

/**
 * Lets you to merge multiple bit classes into one class which allows code abstraction into mixins/traits.
 * Use it like export class MyBit extends mixins(MixinA, MixinB). All Mixin classes must extend the AbstractBit class!
 * @param ctors
 */
export function mixins(...ctors: BitClass<AbstractBit>[]): BitClass<AbstractBit>
{
    const mixedConstructors: Array<Function | any> = [];
    const mixedLifecycleHooks: Map<string, Array<Function>> = new Map();
    
    let mixedCtor = class extends AbstractBit
    {
        constructor(context: BitContext)
        {
            super(context);
            
            forEach(mixedConstructors, constructor => {
                constructor.call(this, context);
            });
            
            forEach(mixedLifecycleHooks, (hooks, name) => {
                const implementedHook = this[name] ?? null;
                
                this[name] = function () {
                    forEach(hooks, hook => {
                        hook.call(this);
                    });
                    
                    if (implementedHook) {
                        implementedHook.call(this);
                    }
                };
            });
        }
    };
    
    let def = DefinitionRegistry.getDefinitionFor(mixedCtor.prototype);
    
    forEach(ctors, ctor => {
        
        // Inherit the information from the parent class
        Object.getOwnPropertyNames(ctor.prototype).forEach(name => {
            const func = ctor.prototype[name];
            if (name !== 'constructor') {
                if (lifecycleHooks.indexOf(name) !== -1) {
                    const hooks = mixedLifecycleHooks.get(name) ?? [];
                    hooks.push(func);
                    mixedLifecycleHooks.set(name, hooks);
                }
                mixedCtor.prototype[name] = func;
            } else {
                mixedConstructors.push(func);
            }
        });
        
        // Inherit the bit definition from the parent class
        def = def.mergeWith(
            DefinitionRegistry.getDefinitionFor(
                ctor.prototype
            )
        );
        
    });
    
    (mixedCtor.prototype as any).__MIXIN_DEFINITION = def;
    
    // @ts-ignore
    return mixedCtor as any;
}
