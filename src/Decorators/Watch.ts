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
 * Last modified: 2021.03.19 at 10:13
 */

import {DefinitionRegistry} from '../Core/Definition/DefinitionRegistry';
import type {IWatchOptions, TWatchTarget} from '../Reactivity/types';

/**
 * Registers the method it was applied to as watcher/reaction
 * @see https://mobx.js.org/reactions.html#reaction
 *
 * @param target Either the name of the property to watch, or an expression to define the watchable target,
 *                like function(){return this.computed}. ATTENTION: If you use a function as target, make sure to use function(){},
 *                instead of a fat-arrow function!
 * @param options Additional options that define how the watcher is executed
 * @constructor
 */
export function Watch(target: TWatchTarget, options?: IWatchOptions)
{
    return (element: any, name: string) => {
        DefinitionRegistry.getDefinitionFor(element).addWatcher(name, target, options);
    };
}