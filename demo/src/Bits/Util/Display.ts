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
 * Last modified: 2021.03.14 at 22:34
 */

import {AbstractBit, Data, html, Listener, Property} from '@labor-digital/bits';
import {map} from '@labor-digital/helferlein';

export class Display extends AbstractBit
{
    /**
     * If set to false, the messages received will not vanish after 2 seconds
     * @protected
     */
    @Property({type: Boolean})
    protected useTimeout: boolean = true;
    
    @Data()
    protected entries: Array<string> = [];
    
    @Listener('showMessage')
    protected onMessageReceived(e: any): void
    {
        this.entries.push(e.args.message);
        if (this.useTimeout) {
            this.$proxy.setTimeout(() => {
                this.entries.shift();
            }, 2000);
        }
    }
    
    public mounted()
    {
        this.$html('@content', () => html`
            <ul class="list-group">
                ${map(this.entries, entry => html`
                    <li class="list-group-item">${entry}</li>`)}
            </ul>
        `);
    }
}