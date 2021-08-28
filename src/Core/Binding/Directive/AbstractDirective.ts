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
 * Last modified: 2021.08.27 at 22:31
 */

import {autorun} from 'mobx';
import {AbstractBindable} from '../Bindable/AbstractBindable';

export interface AbstractDirective
{
    /**
     * Lifecycle hook, executed ONCE, when the directive was mounted to the DOM,
     * AND the value has been resolved correctly.
     *
     * @param value The value of the bit property, which was defined as value in the HTML "data-$directive" attribute.
     */
    mounted?(value: any): void;
    
    /**
     * Lifecycle hook, executed every time the reactive value got updated.
     *
     * @param value The new value of the bit property, which was defined through the HTML attribute
     */
    update?(value: any): void;
    
    /**
     * Lifecycle hook, executed ONCE when the directive gets removed from the DOM.
     */
    unmount?(): void;
}

export abstract class AbstractDirective extends AbstractBindable
{
    public async bind(value: any): Promise<void>
    {
        let bound = false;
        
        const prop = value ? await this.binder.getAccessor(value) : null;
        
        this.disposers.push(
            autorun(() => {
                const val = prop ? prop.get() : prop;
                if (!bound) {
                    bound = true;
                    if (this.mounted) {
                        this.mounted(val);
                    }
                } else if (this.update) {
                    this.update(val);
                }
            })
        );
    }
    
    public destroy(): void
    {
        if (this.unmount) {
            this.unmount();
        }
        
        super.destroy();
    }
}