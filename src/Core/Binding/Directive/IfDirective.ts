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
 * Last modified: 2021.08.27 at 23:04
 */

import {isNumeric} from '@labor-digital/helferlein';
import {AbstractDirective} from './AbstractDirective';
import type {ITransitionDisposer} from './transitionUtil';
import {handleTransition} from './transitionUtil';

export class IfDirective extends AbstractDirective
{
    requireValue = true;
    
    protected initial!: string;
    protected transitionDisposer?: ITransitionDisposer;
    protected elseEl?: HTMLElement;
    
    protected readonly transition?: string;
    protected readonly transitionDuration?: string;
    protected readonly ifDisplay?: string;
    
    public async bind(value: any): Promise<void>
    {
        const next = this.$el.nextElementSibling as HTMLElement | undefined;
        this.elseEl = next && next.dataset && next.dataset.else !== undefined ? next : undefined;
        
        await this.$registerDataGetter('transition');
        await this.$registerDataGetter('transitionDuration');
        await this.$registerDataGetter('ifDisplay');
        
        await super.bind(value);
    }
    
    public mounted(value: any)
    {
        this.initial = this.$el.style.display ?? '';
        this.calculate(value, true);
    }
    
    public update(value: any)
    {
        this.calculate(value, false);
    }
    
    public unmount()
    {
        this.transitionDisposer && this.transitionDisposer();
        this.$el.style.display = this.initial;
    }
    
    protected calculate(value: any, initial: boolean): void
    {
        this.transitionDisposer && this.transitionDisposer();
        
        const trueDisplayType = this.ifDisplay || 'block';
        
        if (!initial && this.$el.dataset.transition !== undefined) {
            this.transitionDisposer = handleTransition(
                this.$el,
                !!value,
                this.transition,
                isNumeric(this.transitionDuration) ? parseInt(this.transitionDuration) : undefined,
                trueDisplayType,
                this.elseEl
            );
        } else {
            this.elseEl && (this.elseEl.style.display = !value ? trueDisplayType : 'none');
            this.$el.style.display = !!value ? trueDisplayType : 'none';
        }
    }
}