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
 * Last modified: 2021.04.15 at 15:22
 */

import {DefinitionRegistry} from '../Core/Definition/DefinitionRegistry';

/**
 * By default, every method in a bit, that is not a "computed" or decorated using "@Listener", "@AutoRun" or "@Watch" will be
 * used as "action" (https://doc.ebichu.cc/mobx/refguide/action.html) by the mobx reactivity handler.
 * There some edge cases where you might not want that. In that case simply decorate the method in question using @NonAction,
 * and it will not be handled as action by mobx.
 * @constructor
 */
export function NonAction(): any
{
    return (element: any, name: string) => {
        DefinitionRegistry.getDefinitionFor(element).addNonObservable(name);
    };
}