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
 * Last modified: 2021.03.14 at 17:24
 */

import {BitDefinition} from './BitDefinition';

const definitions: Map<any, BitDefinition> = new Map();

export class DefinitionRegistry
{
    /**
     * Checks if the given prototype is already known and has a bit definition
     * @param prototype
     */
    public static hasDefinitionFor(prototype: any): boolean
    {
        return definitions.has(prototype);
    }
    
    /**
     * Returns either an existing bit definition for the given prototype, or a new, empty one
     *
     * @param prototype
     */
    public static getDefinitionFor(prototype: any): BitDefinition
    {
        if (prototype.__MIXIN_DEFINITION) {
            return prototype.__MIXIN_DEFINITION;
        }
        
        if (!definitions.has(prototype)) {
            definitions.set(prototype, new BitDefinition(prototype));
        }
        return definitions.get(prototype)!;
    }
}