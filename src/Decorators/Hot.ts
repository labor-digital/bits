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
 * Last modified: 2021.04.08 at 22:28
 */

import type * as Module from 'module';
import {HmrRegistry} from '../Core/HmrRegistry';

/**
 * Use this decorator on your bit class to make it aware of hot module replacement requests,
 * by webpack or other module bundlers. The usage is dead easy, just add "@Hot(module)" on top of your
 * bit class and you are set up.
 *
 * @param module The module we want to track hot updates for
 * @constructor
 */
export function Hot(module: Module): any
{
    if (!module) {
        throw new Error('Invalid usage of the @Hot decorator! Please write "@Hot(module)"!');
    }
    
    return (element: any) => {
        if (module.hot) {
            module.hot.accept();
            
            module.hot.dispose((data) => {
                data.reload = true;
                data.id = element.__hmrId;
            });
            
            if (module.hot.data && module.hot.data.reload) {
                HmrRegistry.replaceCtor(module.hot.data.id, element);
            } else {
                HmrRegistry.registerCtor(element);
            }
        }
    };
}