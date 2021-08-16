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
 * Last modified: 2021.03.09 at 13:37
 */

import {configure} from 'mobx';
import {Bootstrap} from './Bootstrap';
import type {DiContainer} from './Di/DiContainer';
import {HmrRegistry} from './HmrRegistry';
import {Es5Adapter} from './Mount/Es5Adapter';
import {Es6Adapter} from './Mount/Es6Adapter';
import {canUseEs6Features} from './Mount/util';
import type {IBitAppOptions} from './types';

export class BitApp
{
    /**
     * The instance of the dependency injection container
     * @hidden
     */
    protected _di: DiContainer;
    
    /**
     * @hidden
     */
    protected _mountTag: string;
    
    /**
     * The options provided to the application
     * @protected
     */
    protected _options: IBitAppOptions;
    
    constructor(options?: IBitAppOptions, autoRun?: boolean)
    {
        this._options = Bootstrap.prepareOptions(options);
        this._di = Bootstrap.makeContainer(this);
        this._mountTag = this._options.mountTag!;
        
        if (autoRun !== false) {
            this.run();
        }
    }
    
    /**
     * Runs the application and returns a promise when it has been mounted to the DOM.
     * NOTE: Until the next version the app runs automatically once the class is created
     * @todo remove the autoRun option in the next release and make this a default
     */
    public run(): Promise<BitApp>
    {
        return Bootstrap
            .runHook('created', this)
            .then(() => {
                this.mount();
                HmrRegistry.registerApp(this);
            })
            .then(() => Bootstrap.runHook('mounted', this))
            .then(() => this);
    }
    
    /**
     * Returns the options provided to the application
     */
    public get options(): IBitAppOptions
    {
        return this._options;
    }
    
    /**
     * Returns the configured bit mount tag for this app
     */
    public get mountTag(): string
    {
        return this._mountTag;
    }
    
    /**
     * Returns the dependency injection container for this app
     */
    public get di(): DiContainer
    {
        return this._di;
    }
    
    /**
     * Internal helper to register the mount bit as a custom element
     * @protected
     */
    protected mount(): void
    {
        const app = this;
        
        if (canUseEs6Features()) {
            window.customElements.define(this.mountTag,
                // @ts-ignore
                class extends Es6Adapter
                {
                    constructor() {super(app);}
                }
            );
        } else {
            configure({useProxies: 'never'});
            Es5Adapter.registerApp(this);
        }
    }
}