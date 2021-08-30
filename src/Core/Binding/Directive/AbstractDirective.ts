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

import {isString} from '@labor-digital/helferlein';
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
    /**
     * Helper to create a reactive getter for the value of a "data" attribute.
     * It can resolve either a static value, or a reference on a data property in the local bit.
     *
     * Should be used in the "bind()" hook, to avoid overhead while resolving the accessors later.
     *
     * @example
     * <div data-my-dir="foo" data-my-attribute="baz" data-my-prop="@property"></div>
     *
     * @example
     * public async bind(value: any): Promise<void>
     * {
     *    await this.registerDataGetter('myAttribute');
     *    await this.registerDataGetter('myProp');
     *
     *    await super.bind(value);
     * }
     *
     * @example
     * // After the registration you can use the getter anywhere in your directive
     * // If a data attribute is not defined undefined is returned
     * protected myMethod(){
     *      console.log(this.myAttribute); // => "baz"
     *      console.log(this.myProp); // => Returns the value of the "property" property in the bit
     * }
     *
     * @param attr the camel-backed name of the data property to read.
     * @protected
     */
    protected async registerDataGetter(attr: string): Promise<void>
    {
        let v = this.el.dataset[attr];
        let getter: () => string | undefined = () => undefined;
        if (isString(v)) {
            v = v.trim();
            
            if (v[0] === '@') {
                const prop = await this.context.binder.getAccessor(v.substr(1));
                if (prop) {
                    getter = () => prop.get();
                }
                
            } else {
                getter = () => v!;
            }
        }
        
        Object.defineProperty(this, attr, {
            get: function () {
                return getter();
            }
        });
    }
    
    /**
     * Inherited from the "AbstractBindable" super class,
     * but also registers the call of the "update" method for when the value changes
     *
     * @param value
     */
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