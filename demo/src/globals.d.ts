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
 * Last modified: 2021.06.30 at 15:05
 */

import {ServiceA} from './Services/ServiceA';
import {ServiceB} from './Services/ServiceB';

// Extends the type of the di container to add autocompletion support for the services
// added by the application. This step is completely optional
declare module '@labor-digital/bits/dist/Core/Di/DiContainer'
{
    interface DiContainer
    {
        stringService: ServiceB,
        helloService: ServiceA
    }
}