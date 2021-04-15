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
 * Last modified: 2021.04.15 at 11:25
 */


import type {IAutorunOptions} from 'mobx';
import {DefinitionRegistry} from '../Core/Definition/DefinitionRegistry';

/**
 * Autorun can be used in those cases where you want to create a reactive function that will never have observers itself.
 * This is usually the case when you need to bridge from reactive to imperative code, for example for logging,
 * persistence or UI-updating code.
 *
 * As a rule of thumb: use autorun if you have a function that should run automatically but that doesn't
 * result in a new value.
 *
 * When a method was decorated with Autorun, it will always be triggered once after the "mounted()" lifecycle method
 * and then again each time one of its dependencies changes.
 *
 * @constructor
 */
export function AutoRun(options?: IAutorunOptions): any
{
    return (element: any, name: string) => {
        DefinitionRegistry.getDefinitionFor(element).addAutoRun(name, options);
    };
}