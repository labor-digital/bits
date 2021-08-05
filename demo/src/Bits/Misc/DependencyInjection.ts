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
 * Last modified: 2021.06.30 at 14:11
 */

import {AbstractBit, Hot} from '@labor-digital/bits';

@Hot(module)
export class DependencyInjection extends AbstractBit
{
    public mounted()
    {
        // You can use the $di special property to access the dependency injection container
        // It allows you to access global services, like axios or other libraries.
        // To register
        this.$di.helloService.sayHello();
        this.$eventBus.emit('globalEvent');
    }
}