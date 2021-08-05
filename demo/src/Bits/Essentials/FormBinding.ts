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
 * Last modified: 2021.03.08 at 04:28
 */

import {AbstractBit, Data, Listener} from '@labor-digital/bits';
import {isUndefined, PlainObject} from '@labor-digital/helferlein';

export class FormBinding extends AbstractBit
{
    @Data()
    data: PlainObject = {
        gender: null,
        firstName: null,
        lastName: null,
        birthday: null,
        color: null,
        bio: null,
        languages: null,
        workDays: null
    };
    
    @Listener('click', '@set')
    onSetClick(e: MouseEvent)
    {
        const defaults = {
            gender: 'female',
            firstName: 'Maximilia',
            lastName: 'Musterman',
            birthday: '1988-02-14',
            color: 'green',
            bio: 'I came, I saw, and I couldn\'t believe my eyes',
            languages: ['php', 'js'],
            workDays: ['2', '4', '0']
        };
        
        const field: string = (e.target as HTMLElement).dataset.field!;
        if (defaults[field]) {
            this.data[field] = defaults[field];
        }
    }
    
    @Listener('click', '@clear')
    onClearClick(e: MouseEvent)
    {
        const field: string = (e.target as HTMLElement).dataset.field!;
        if (!isUndefined(this.data[field])) {
            this.data[field] = null;
        }
    }
}