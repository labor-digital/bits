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
 * Last modified: 2021.03.05 at 11:27
 */

import {DefinitionRegistry} from '../Core/Definition/DefinitionRegistry';
import type {IDataPropertyOptions} from '../Reactivity/types';

/**
 * Registers an INTERNAL, reactive data property. This allows you to define properties that will
 * react to state changes and are observable, but only inside your element. They will not be mirrored
 * to the outside world or inherit their value from the dom tree.
 *
 * @param options
 * @constructor
 */
export function Data(options?: IDataPropertyOptions): any
{
    return (element: any, name: string) => {
        DefinitionRegistry.getDefinitionFor(element).addProperty(name, {
            attribute: false,
            reflect: false,
            changeDetector: options?.changeDetector ?? undefined,
            type: options?.type ?? undefined
        });
    };
}