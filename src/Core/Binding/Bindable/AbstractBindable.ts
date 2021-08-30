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
 * Last modified: 2021.08.28 at 15:20
 */

import {forEach} from '@labor-digital/helferlein';
import type {IReactionDisposer} from 'mobx';
import type {Binder} from '../Binder';
import type {BinderContext} from '../BinderContext';

export interface AbstractBindable
{
    /**
     * If this property is set to TRUE, the bindable MUST have a value, otherwise the
     * creation fails and an error is rendered
     */
    requireValue?: boolean;
    
    /**
     * Lifecycle hook, executed when the bindable is being removed from the DOM
     */
    unbind?(): void;
}

export abstract class AbstractBindable
{
    /**
     * The reference to the html element this class was bound to
     * @protected
     */
    protected $el: HTMLElement;
    
    /**
     * The binder context
     * @protected
     */
    protected $context: BinderContext;
    
    /**
     * List of reaction disposers to be executed when the bindable is destroyed
     * @protected
     */
    protected $disposers: Array<IReactionDisposer | Function> = [];
    
    constructor(el: HTMLElement, context: BinderContext)
    {
        this.$el = el;
        this.$context = context;
    }
    
    /**
     * The binder instance for extended API methods
     * @protected
     */
    protected get $binder(): Binder
    {
        return this.$context.binder;
    }
    
    /**
     * Lifecycle hook, executed when the bindable is bound/mounted to the DOM node.
     * @param value The value of the matching data-$key attribute on the dom element
     */
    abstract bind(value: any): Promise<void>;
    
    /**
     * This is the the DANGER ZONE! Calling this method will destroy the bindable instance completely
     * @protected
     */
    public $destroy(): void
    {
        this.unbind && this.unbind();
        
        forEach(this.$disposers, disposer => disposer());
        
        this.$el = null as any;
        this.$context = null as any;
        this.$disposers = null as any;
    }
}