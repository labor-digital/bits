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
 * Last modified: 2021.03.04 at 14:55
 */

import {DefinitionRegistry} from '../Core/Definition/DefinitionRegistry';
import type {IPropertyOptions} from '../Reactivity/types';

/**
 * Registers a new property for the element. Properties can retrieve their data directly
 * from the dom tree by being mirrored to an attribute. They can even mirror the internal
 * changes back to the dom using the "reflect" option.
 *
 * A property is also a reactive to changes and is therefore considered "observable".
 *
 * Note: If you only want to hold reactive data internally, you should consider using the @Data
 * decorator instead. It makes the field reactive, without providing it to the outside world.
 *
 * @param options
 * @constructor
 */
export function Property(options?: IPropertyOptions): any
{
    return (element: any, name: string) => {
        DefinitionRegistry.getDefinitionFor(element).addProperty(name, options);
    };
}