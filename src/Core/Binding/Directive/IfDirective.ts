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

import {AbstractDirective} from './AbstractDirective';

export class IfDirective extends AbstractDirective
{
    protected initial!: string;
    
    public mounted(value: any)
    {
        this.initial = this.el.style.display ?? '';
        this.calculate(value);
    }
    
    public update(value: any)
    {
        this.calculate(value);
    }
    
    public unmount()
    {
        this.el.style.display = this.initial;
    }
    
    protected calculate(value: any): void
    {
        // const transition = this.el.dataset.transition ?? null;
        this.el.style.display = !!value ? 'block' : 'none';
    }
}