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
 * Last modified: 2021.03.07 at 20:39
 */

import {AbstractBit, Listener} from '@labor-digital/bits';
import {closest, getGuid} from '@labor-digital/helferlein';

export class Templates extends AbstractBit
{
    @Listener('click', '@remove')
    onRemoveClick(e: MouseEvent)
    {
        const el = closest('li', e.target as HTMLElement);
        el?.parentElement!.removeChild(el);
    }
    
    @Listener('click', '@add')
    onAddChild()
    {
        // We clone a template node with the data-ref="tpl" attribute using the $tpl() method
        // and append it onto our elements node. While we do that, we can pass some initial
        // values to the template that will be auto-injected in elements containing the data-value="key"
        // attribute.
        this.$find('@elements')!.appendChild(
            this.$tpl('tpl', {
                id: getGuid('entry ')
            })
        );
        
        // Now, because we changed the dom in a way that can not be tracked by the system,
        // we manually have to tell it, that it should rebind all static event listeners (@Listener annotation) and all
        // one- and two-way data bindings for us. This can be done easily, by executing the $domChanged() method.
        // NOTE: Please don't overuse this feature, or you might see performance drops!
        this.$domChanged();
        
        // Pro tip: Under the hood a "domChange" event will bubble up the dom tree and will also
        // update all other bit mounts it meets along the way. This means that all your parent
        // nodes will also rebind their data.
        
        // Super-Pro tip: You can listen for a "domChange" either using a event listener with this.$on('domChange'),
        // or by using the domChanged() lifecycle hook
    }
}