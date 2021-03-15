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
 * Last modified: 2021.03.15 at 00:19
 */

import {AbstractBit, Listener, Property} from '@labor-digital/bits';

export class ReactivityButton extends AbstractBit
{
    @Property({type: Number})
    protected counter: number = 0;
    
    @Listener('click', '#counter-button')
    protected onClick(): void
    {
        this.counter++;
    }
}