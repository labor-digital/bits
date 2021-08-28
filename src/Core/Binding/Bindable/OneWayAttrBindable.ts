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
 * Last modified: 2021.08.28 at 17:07
 */

import {forEach} from '@labor-digital/helferlein';
import {autorun} from 'mobx';
import {setElementAttribute, splitMapString} from '../util';
import {AbstractBindable} from './AbstractBindable';

export class OneWayAttrBindable extends AbstractBindable
{
    requireValue = true;
    
    public bind(value: any): Promise<void>
    {
        const children: Array<Promise<any>> = [];
        const binder = this.binder;
        
        forEach(splitMapString(value), pair => {
            children.push(
                binder.makePromise(async resolve => {
                    const prop = await binder.getAccessor(pair.source);
                    
                    if (!prop) {
                        return resolve();
                    }
                    
                    this.disposers.push(
                        autorun(() => {
                            setElementAttribute(this.el, pair.target, prop.get());
                        })
                    );
                    
                    resolve();
                })
            );
        });
        
        return Promise.all(children).then();
    }
    
}