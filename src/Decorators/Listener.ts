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
 * Last modified: 2021.03.05 at 13:21
 */

import {DefinitionRegistry} from '../Core/Definition/DefinitionRegistry';
import type {TEventList, TEventTarget} from '../Core/types';


/**
 * Registers the decorated method as an event listener
 *
 * @param event Either a single event like "click" or an array of events ["mouseenter", "mouseleave"]
 * @param selector Either a html selector, an @reference selector provided by this.$find,
 *                  or a function that resolves the target dynamically. The provider function will have
 *                  its "this" bound to the instance of the bit class, so you can use all methods of your object.
 *                  If left empty, the element itself will be bound as a
 * @param deep By default only elements inside the current mount are added as listeners, but nodes inside child mounts are ignored.
 *                  If you set this to true, even elements in child-mounts are returned
 */
export function Listener(
    event: TEventList,
    selector?: TEventTarget,
    deep?: boolean
): any
{
    return (element: any, name: string) => {
        DefinitionRegistry.getDefinitionFor(element).addEventListener(name, selector, event, deep);
    };
}