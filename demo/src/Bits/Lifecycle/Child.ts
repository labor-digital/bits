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
 * Last modified: 2021.03.11 at 01:16
 */

import {AbstractBit, html} from '@labor-digital/bits';
import {emitDomEvent} from '@labor-digital/helferlein';

export class Child extends AbstractBit
{
    onRemove()
    {
        const el = this.$context.mount.el!;
        el.parentElement!.removeChild(el);
    }
    
    onMove(keepAlive?: boolean)
    {
        const el = this.$context.mount.el!;
        const parent = el.parentElement!;
        if (keepAlive) {
            el.setAttribute('keep-alive', '1');
        }
        
        parent.removeChild(el);
        parent.appendChild(el);
        
        setTimeout(() => {
            el.removeAttribute('keep-alive');
        }, 100);
    }
    
    protected showMessage(message: string): void
    {
        emitDomEvent(document.getElementById('displayElement') as any, 'showMessage', {message});
    }
    
    public created()
    {
        this.showMessage('[Lifecycle] Child executed: created()');
    }
    
    public unmounted()
    {
        this.showMessage('[Lifecycle] Child executed: unmounted()');
    }
    
    public remounted()
    {
        this.showMessage('[Lifecycle] Child executed: remounted()');
    }
    
    public beforeDestroy()
    {
        this.showMessage('[Lifecycle] Child executed: beforeDestroy()');
    }
    
    public destroyed()
    {
        this.showMessage('[Lifecycle] Child executed: destroyed()');
    }
    
    public domChanged()
    {
        this.showMessage('[Lifecycle] Child executed: domChanged()');
    }
    
    public mounted()
    {
        this.showMessage('[Lifecycle] Child executed: mounted()');
        
        this.$html('@content', () => html`
            <div class="btn-group flex-wrap">
                <button class="btn btn-danger btn-sm" @click="${this.onRemove}">Remove me</button>
                <button class="btn btn-primary btn-sm" @click="${this.$domChanged}">Emit dom change</button>
                <button class="btn btn-primary btn-sm" @click="${() => this.onMove(false)}">Move me</button>
                <button class="btn btn-primary btn-sm" @click="${() => this.onMove(true)}">Move me (keep-alive)</button>
            </div>
        `);
    }
}