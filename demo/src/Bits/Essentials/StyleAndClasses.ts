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
import {PlainObject} from '@labor-digital/helferlein';

export class StyleAndClasses extends AbstractBit
{
    @Data()
    color: string = 'green';
    
    get style(): PlainObject
    {
        return {
            width: '50px',
            height: '50px',
            padding: '20px',
            backgroundColor: this.color
        };
    }
    
    get classes(): PlainObject
    {
        return {
            'mb-3': true,
            'is-green': this.color === 'green',
            'is-purple': this.color === 'purple',
            'is-aqua': this.color === 'aqua',
            ['color-' + this.color]: true
        };
    }
    
    @Listener('click', '@change')
    protected onClick()
    {
        const colors = ['purple', 'blue', 'red', 'yellow', 'aqua'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }
}