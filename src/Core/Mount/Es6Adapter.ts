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
 * Last modified: 2021.03.10 at 22:19
 */
import type {AbstractBit} from '../AbstractBit';
import type {BitApp} from '../BitApp';
import {Mount} from './Mount';
import type {BitMountHTMLElement} from './types';
import {canUseEs6Features} from './util';

export let Es6Adapter: any = class
{
};

// We have to define this class rather awkwardly, because otherwise IE11 will cry.
// This can be migrated to a normal es6 class if we drop support for es5
if (canUseEs6Features()) {
    Es6Adapter = class extends HTMLElement implements BitMountHTMLElement
    {
        public _bitMount: Mount;
        
        //@ts-ignore
        constructor(app: BitApp)
        {
            // We can't use super here, because otherwise typescript runs amok with our HTMLElement.
            // Because want to build the script for an es5 target. So we have to take stuff into our own hands
            // and reflect the html element and create a new "this" correctly. Sadly, typescript does not like,
            // that we are not calling super() anywhere (Hence the ts-ignore flood). Luckily we only have to do this
            // once, for this component.
            // @ts-ignore
            this = Reflect.construct(HTMLElement, [], this.__proto__.constructor);
            // @ts-ignore
            this._bitMount = new Mount(app);
            // @ts-ignore
            return this;
        }
        
        /**
         * Returns the instance of the bit or null if there is none currently active.
         */
        public get bit(): AbstractBit | undefined
        {
            return this._bitMount!.bit;
        }
        
        /**
         * Web-Component lifecycle hook
         * Invoked each time the custom element is appended into a document-connected element.
         * This will happen each time the node is moved, and may happen before the element's contents have been
         * fully parsed.
         */
        public async connectedCallback()
        {
            if (!this.isConnected) {
                return;
            }
            
            return this._bitMount!.connect(this);
        }
        
        /**
         * Web-Component lifecycle hook
         * Invoked each time the custom element is disconnected from the document's DOM.
         */
        public disconnectedCallback()
        {
            this._bitMount!.disconnect();
        }
    };
}
