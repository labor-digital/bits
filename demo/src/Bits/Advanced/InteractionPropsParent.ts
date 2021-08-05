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
 * Last modified: 2021.03.07 at 18:54
 */

import {AbstractBit, Data} from '@labor-digital/bits';

export class InteractionPropsParent extends AbstractBit
{
    @Data()
    prop: string = 'Read me downstairs :D';
    
    @Data()
    model: string = 'I go both ways!';
    
    get classes()
    {
        return {
            'has-prop': this.prop !== '',
            'has-model': this.model !== ''
        };
    }
}