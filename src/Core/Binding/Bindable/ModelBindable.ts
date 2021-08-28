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
 * Last modified: 2021.08.28 at 16:27
 */

import {autorun} from 'mobx';
import {getElementValue, setElementValue} from '../util';
import {AbstractBindable} from './AbstractBindable';

export class ModelBindable extends AbstractBindable
{
    requireValue = true;
    
    public async bind(value: any): Promise<void>
    {
        const binder = this.binder;
        const pullable = this.context.pullableProperties ?? [];
        const prop = await binder.getAccessor(value);
        
        if (!prop) {
            return;
        }
        
        const bind = (event: string) =>
            this.context.proxy.bind(this.el, event, async e => {
                if (e.target !== this.el) {
                    return;
                }
                
                const n = await getElementValue(this.el, prop);
                if (n === prop.get()) {
                    return;
                }
                
                prop.set(n);
            });
        
        bind('change');
        bind('keyup');
        
        // If the value is NULL we register this property as nullable, meaning
        // even if we pull multiple instances (options, checkbox,...) for the same property
        // it will pull all variants
        const propertyValue = prop.get();
        if (propertyValue === null) {
            pullable.push(prop.path);
        }
        
        // Either pull the value into the property (property is NULL), or set the value of the input field (not NULL)
        if (pullable.indexOf(prop.path) !== -1) {
            prop.set(await getElementValue(this.el, prop));
        } else {
            setElementValue(this.el, propertyValue);
        }
        
        this.disposers.push(autorun(() => setElementValue(this.el, prop.get())));
    }
}