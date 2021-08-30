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
 * Last modified: 2021.08.28 at 15:40
 */

import {autorun} from 'mobx';
import {setElementContent} from '../util';
import {AbstractBindable} from './AbstractBindable';

export class OneWayBindable extends AbstractBindable
{
    requireValue = true;
    
    /**
     * True if the data should be html encoded when bound to the dom
     * @protected
     */
    protected escapeContent: boolean = true;
    
    public async bind(value: any): Promise<void>
    {
        const prop = await this.$binder.getAccessor(value);
        
        if (!prop) {
            return;
        }
        
        let initial = true;
        
        this.$disposers.push(
            autorun(() => {
                const val = prop.get();
                
                if (initial) {
                    initial = false;
                    if (val === '') {
                        return;
                    }
                }
                
                setElementContent(this.$el, val, this.escapeContent);
            })
        );
    }
}